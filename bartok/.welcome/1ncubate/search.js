/*

todo:

- [ ] put search in worker so the UI/service worker is not blocked
- [x] make sure results match VS Code's results
	- return multiple results per line
- [x] verify loss of speed is only in building index, not search
	- provide a search box and change searches on the fly
	- measure time to search
- [ ] update a document and search again based on that update
- [ ] integrate with service request handler
- [ ] integrate with client
- [ ] open a file at a given line and column
- [ ] search across all services
- [ ] should use paging and inifinite scroll to increase perf on large results (see the way VSCode does this)
- [ ] add collapse/expand to results
- [ ] add file path to search results

- [YES?] would it be quicker and simpler to just parse all files line by line and return results as available?
	- should probably ask this question on a larger(different) data set

*/
const deps = [
	'../shared.styl',
	'https://www.unpkg.com/flexsearch@0.6.32/dist/flexsearch.min.js'
];

const unique = arr => Array.from(new Set(arr));
const HTMLUtils = new function() {
		var rules = [
				{ expression: /&/g, replacement: '&amp;'  }, // keep this rule at first position
				{ expression: /</g, replacement: '&lt;'   },
				{ expression: />/g, replacement: '&gt;'   },
				{ expression: /"/g, replacement: '&quot;' },
				{ expression: /'/g, replacement: '&#039;' }
		];

		this.escape = function(html) {
				var result = html;

				for (var i = 0; i < rules.length; ++i) {
						var rule = rules[i];

						result = result.replace(rule.expression, rule.replacement);
				}

				return result;
		}
};
const highlight = (term="", str="") => {
	const caseMap = str.split('').map(x => x.toLowerCase() === x ? 'lower' : 'upper');
	let html = '<span>' +
		str.toLowerCase()
			.split(term.toLowerCase())
			.join(`</span><span class="highlight">${term.toLowerCase()}</span><span>`) +
	'</span>';
	html = html.split('');

	let intag = false;
	for (let char = 0, i=0; i < html.length; i++) {
		const thisChar = html[i];
		if(thisChar === '<'){
			intag = true;
			continue;
		}
		if(thisChar === '>'){
			intag = false;
			continue;
		}
		if(intag) continue;

		if(caseMap[char] === 'upper'){
			html[i] = html[i].toUpperCase();
		}
		char++;
	}
	return html.join('');
};
const debounce = (func, wait, immediate) => {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};


const SearchBoxHTML = () => {
	const style = `
	<style>
		.highlight { background: #5f3000; }
		.form-container {
			position: absolute;
			top: 40px;
			left: 0;
			right: 0;
			bottom: 0;
			overflow: hidden;
		}
		.search-results {
			padding: 1em;
			padding-bottom: 15em;
			position: absolute;
			bottom: 0;
			top: 180px;
			overflow-y: auto;
			overflow-x: hidden;
			box-sizing: border-box;
			margin: 0;
			left: 15px;
			right: 15px;
			font-size: 0.95em;
		}
		.search-results > li {
			list-style: none;
			margin-bottom: 1em;
		}
		.search-results > li ul > li {
			font-size: .9em;
			list-style: none;
			white-space: nowrap;
		}
		.search-summary {
			font-size: .85em;
			opacity: 0.7;
		}
		.search-results > li ul { padding-left: 2em; }
		.field-container label { font-size: .75em; }
	</style>
	`;

	const html = `
	<div class="form-container">
		${style}

		<div class="field-container">
			<input type="text" placeholder="Search" class="search-term" spellcheck="false"/>
		</div>

		<div class="field-container">
			<label>include</label>
			<input type="text" class="search-include"/>
		</div>

		<div class="field-container">
			<label>exclude</label>
			<input type="text" class="search-exclude"/>
		</div>

		<div class="field-container">
			<span class="search-summary"></span>
		</div>

		<ul class="search-results"></ul>
	</div>
	`;

	return html;
};
class SearchBox {
	dom
	searchFn

	constructor({ search }){
		this.searchFn = search;
		const main = htmlToElement(SearchBoxHTML());
		this.dom = {
			main,
			term: main.querySelector('.search-term'),
			include: main.querySelector('.search-include'),
			exclude: main.querySelector('.search-exclude'),
			summary: main.querySelector('.search-summary'),
			results: main.querySelector('.search-results')
		}
		this.attachListeners();
		document.body.appendChild(main);
	}
	attachListeners(){
		this.dom.term.addEventListener('input', debounce((event) => {
			const term = event.target.value;
			if(!term || !this.searchFn){
				this.updateResults([],'');
				this.updateSummary({});
				return;
			}
			this.search(term);
		}, 300), true);
	}
	async search(term){
		const { allMatches, time, searchTerm } = await this.searchFn(term);
		this.updateSummary({ allMatches, time, searchTerm: term });
		this.updateResults(allMatches, term);
	}
	updateTerm(term){
		this.dom.term.value = term;
	}
	updateResults(list=[], searchTerm){
		const totalFiles = unique(list.map(x=>x.docName))
			.map(x => ({
				filename: x,
				results: []
			}));
		list.forEach(x => {
			const found = totalFiles.find(y => y.filename.toLowerCase() === x.docName.toLowerCase());
			found.results.push(x);
		});
		this.dom.results.innerHTML = totalFiles
			.map(x => `
				<li>
					<span>${x.filename}<span>
					<ul>${x.results.map(r => `
						<li>
							${highlight(searchTerm, HTMLUtils.escape(r.lineText.trim()))}
						</li>
					`).join('\n')}</ul>
				</li>
			`)
			.join('\n');
	}
	updateSummary({ allMatches, time, searchTerm }){
		if(!allMatches || !allMatches.length){
			this.dom.summary.innerHTML = 'No results';
			return;
		}
		const totalFiles = unique(allMatches.map(x=>x.docName))
			.map(x => ({
				filename: x,
				results: []
			}));
		let results = 0;
		allMatches.forEach(x => {
			results += (x.lineText.toLowerCase().split(searchTerm.toLowerCase()).length -1 )
		});
		const pluralRes = results>1 ? "s" : ''
		const pluralFile = totalFiles.length > 1 ? "s" : ''
		this.dom.summary.innerHTML = `${results} result${pluralRes} in ${totalFiles.length} file${pluralFile}, ${time.toFixed(2)} ms`;
	}
}


const getMatches = (theDoc, searchTerm) => {
	if(typeof theDoc.code !== "string"){
		return [];
	}
	let matches = theDoc.code.split('\n')
		.map((x, i) => ({
			lineNumber: i,
			colNumber: x.toLowerCase().indexOf(searchTerm.toLowerCase()),
			lineText: x,
			docName: theDoc.name
		}))
		.filter(x => x.colNumber !== -1);
	return matches;
};

const gangsterSearch = async (searchTerm, service) => {
	const files = service.code;
	let allMatches = [];
	for(var k=0; k < files.length; k++){
		const theDoc = files[k];
		allMatches = [...allMatches, ...getMatches(theDoc, searchTerm)];
	}
	return allMatches;
};

const flexSearch = async (index, searchTerm, exampleService) => {
	const search = (term, opts={}) => new Promise((resolve, reject) => index.search(term, opts, resolve));
	const res = await search(searchTerm, { limit: false, page: 0+"", suggest: false });
	const formatFlexSearch = (res) => {
		//console.info(JSON.stringify(res,null,2))
		let allMatches = [];
		if(Array.isArray(res) && typeof res[0] === 'object'){
			for(var k=0; k<res.length; k++){
				for(var m=0; m<res[k].result.length; m++){
					const theDoc = exampleService.code[res[k].result[m]];
					allMatches = [...allMatches, ...getMatches(theDoc, searchTerm)];
				}
			}
		} else {
			for(var j=0; j<res.length; j++){
				const theDoc = exampleService.code[j];
				allMatches = [...allMatches, ...getMatches(theDoc, searchTerm)];
			}
		}
		return allMatches;
	}
	const allMatches = formatFlexSearch(res);
	return allMatches;
};

const flexSearchIndex = async (service) => {
	const t0 = performance.now();
	var index = new FlexSearch("speed", {
		encode: "icase",
		tokenize: "reverse",
		async: true,
		worker: 5,
		cache: true
	});
	for(var i=0; i < service.code.length; i++){
		const theDoc = service.code[i];
		if(typeof theDoc.code !== "string"){
			continue;
		}
		await index.add(i, theDoc.code);
	}
	const t1 = performance.now();
	console.log(`Indexing took ${Number(t1 - t0).toFixed(2)} milliseconds.`);
	return index;
};


(async () => {
	const useFlexSearch = false;
	const searchTerm = "li" + "st";

	await appendUrls(deps.filter(x => {
		return useFlexSearch
			? true
			: !x.includes('flexsearch');
	}));
	const exampleService = (await (await fetch('../../service/read/778')).json()).result[0];


	
	var index = useFlexSearch && await flexSearchIndex(exampleService);
	const search = async (term) => {
		const t1 = performance.now();
		const allMatches = useFlexSearch
			? await flexSearch(index, term, exampleService)
			: await gangsterSearch(term, exampleService);
		const t2 = performance.now();

		const time = Number(t2 - t1);
		return { allMatches, time };
	};
	const searchBox = new SearchBox({ search });

	searchBox.updateTerm(searchTerm);
	await searchBox.search(searchTerm);

})();
