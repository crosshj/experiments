/*

todo:

- [ ] include files/directory
- [ ] exclude files/directory
- [ ] update a document and search again based on that update
- [ ] integrate with service request handler
- [ ] integrate with client
- [ ] open a file at a given line and column
- [ ] add file path to search results
- [ ] search across all services
- [x] improve UI is not blocked/janky: async/await & requestAnimationFrame
- [x] make sure results match VS Code's results
- [x] return multiple results per line
- [x] verify loss of speed is only in building index, not search
- [x] provide a search box and change searches on the fly
- [x] measure time to search
- [x] cap results at 1000 / handle large data sets reasonably well, see the way VSCode does this
- [x] add collapse/expand to results
- [LATER] should use paging and inifinite scroll to increase perf on large results
- [LATER] put search in worker so the UI/service worker is not blocked
- [YES?] would it be quicker and simpler to just parse all files line by line and return results as available?
	- should probably ask this question on a larger(different) data set

*/
const deps = [
	'../shared.styl',
	'https://www.unpkg.com/flexsearch@0.6.32/dist/flexsearch.min.js'
];

const unique = arr => Array.from(new Set(arr));
const htmlEscape = html => [
	[/&/g, '&amp;'], //must be first
	[/</g, '&lt;'],
	[/>/g, '&gt;'],
	[/"/g, '&quot;'],
	[/'/g, '&#039;']
].reduce((a,o) => a.replace(...o), html);
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
	return async function() {
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
			font-size: 0.9em;
		}
		.search-results > li {
			list-style: none;
			margin-bottom: 1em;
		}
		.search-results > li ul > li {
			font-size: .9em;
			list-style: none;
			white-space: nowrap;
			margin-top: 0.3em;
		}
		.search-summary {
			font-size: .85em;
			opacity: 0.7;
		}
		.search-results > li ul {
			padding-left: 1.4em;
		}
		.search-results .foldable {
			cursor: pointer;
		}
		.search-results span.doc-path {
			opacity: .5;
		}
		.search-results .foldable ul { display: none; }
		.search-results .foldable > div span {
			padding-left: 0.4em;
			pointer-events: none;
			user-select: none;
		}
		.search-results .foldable > div:before {
			margin-left: 0px;
			margin-right: 7px;
			content: '>';
			font-family: consolas, monospace;
			display: inline-block;
		}
		.search-results .foldable.open ul { display: block; }
		.search-results .foldable.open > div:before {
			margin-left: 2px;
			margin-right: 5px;
			content: '>';
			transform-origin: 5px 8.5px;
			transform: rotateZ(90deg);
		}
		.field-container label { font-size: .75em; }


		 @font-face {
			font-family: 'seti';
			src: url(/shared/fonts/seti.woff2) format('woff2');
			font-weight: normal;
			font-style: normal;
		}
		.icon-html:before,
		.icon-json:before,
		.icon-info:before {
			font-family: 'seti';
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
			font-style: normal;
			font-variant: normal;
			font-weight: normal;
			text-decoration: none;
			text-transform: none;
			width: 22px;
			height: 22px;
			display: inline-block;
			-webkit-font-smoothing: antialiased;
			vertical-align: top;
			flex-shrink: 0;
			font-size: 21px;
			margin-top: -1px;
			margin-left: -7px;
		}
		.icon-info:before {
			content: '\\E048';
			color: #519aba;
		}
		.icon-json:before {
			content: '\\E043';
			color: #e37933;
		}
		.icon-html:before {
			content: '\\E050';
			color: #ff9800;
		}
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
		const debouncedInputListener = debounce((event) => {
			const term = event.target.value;
			if(!this.searchFn){
				this.updateResults([],'');
				this.updateSummary({});
				return;
			}
			this.search(term);
		}, 250, false);
		this.dom.term.addEventListener('input', (e) => {
			this.updateSummary({ loading: true });
			this.updateResults({ loading: true });
			debouncedInputListener(e);
		})
		this.dom.results.addEventListener('click', (e) => {
			const handler = {
				'DIV foldable': () => e.target.parentNode.classList.add('open'),
				'DIV foldable open': () => e.target.parentNode.classList.remove('open')
			}[`${e.target.tagName} ${e.target.parentNode.className}`];
			
			if(handler) return handler();
		})
	}
	async searchStream({ term, include, exclude }){
		this.updateResults([],'');
		this.updateSummary({});

		const base = new URL('../../service/search', location.href).href
		const res = (await fetch(`${base}/?term=${term}&include=${include||''}&exclude=${exclude||''}`));
		const reader = res.body.getReader()
		const decoder = new TextDecoder("utf-8");
		const timer = { t1: performance.now() }
		let allMatches = [];
		while(true){
			const { done, value } = await reader.read();
			if(done) break;
			const results = decoder.decode(value).split('\n').filter(x=>!!x)
			results.forEach(x => {
				try{
					const parsed = JSON.parse(x)
					parsed.docName = parsed.file.split('/').pop();
					parsed.path = parsed.file.replace('/'+parsed.docName, '').replace(/^\.\//, '')
					allMatches.push(parsed)
					const items = ['html', 'json', 'info'];
					const iconClass = "icon-" + items[Math.floor(Math.random() * items.length)];
					const fileResultsEl = htmlToElement(`
						<li class="foldable open">
							<div>
								<span class="${iconClass}">${parsed.docName}</span>
								<span class="doc-path">${parsed.path}</span>
							</div>
							<ul>${[parsed]
							.map((r,i) => `
								<li>
									${highlight(term, htmlEscape(r.text.trim()))}
								</li>
							`).join('\n')}</ul>
						</li>
					`);
					window.requestAnimationFrame(async () => {
						this.dom.results.appendChild(fileResultsEl)
					});
				} catch(e){
					console.error(`trouble parsing: ${x}, ${e}`)
				}
			})
		}
		allMatches = allMatches.map(x => ({
			...x,
			docName: x.file.split('/').pop()
		}))
		timer.t2 = performance.now();
		this.updateSummary({ allMatches, time: timer.t2 - timer.t1, searchTerm: term })
	}
	async search(term){
		this.searchTerm = term;
		if(!term){
			this.updateResults([],'');
			this.updateSummary({});
			return;
		}
		const { allMatches, time, searchTerm } = await this.searchFn(term);
		this.updateSummary({ allMatches, time, searchTerm: term });
		this.updateResults(allMatches, term);
	}
	updateTerm(term){ this.dom.term.value = term; }
	updateInclude(path){ this.dom.include.value = path; }
	
	async updateResults(list=[], searchTerm, append){
		if(list.loading){
			this.dom.results.innerHTML = '';
			return;
		}
		const totalFiles = unique(list.map(x=>x.docName))
			.map(x => ({
				filename: x,
				results: []
			}));
		list.forEach(x => {
			const found = totalFiles.find(y => y.filename.toLowerCase() === x.docName.toLowerCase());
			found.results.push(x);
		});

		this.dom.results.innerHTML = '';

		for(var i=0; i<totalFiles.length;i++) {
			if(searchTerm !== this.searchTerm){
				return;
			}
			await new Promise((resolve) => {
				if(searchTerm !== this.searchTerm){
					return resolve();
				}
				const x = totalFiles[i];
				const deDupeResults = x.results
					.filter((r, i, arr) => {
						return i === 0 || r.lineText !== x.results[i-1].lineText
					});
				const items = ['html', 'json', 'info'];
				const iconClass = "icon-" + items[Math.floor(Math.random() * items.length)];
				const fileResultsEl = htmlToElement(`
					<li class="foldable open">
						<div><span class="${iconClass}">${x.filename}</span></div>
						<ul>${deDupeResults
						.map((r,i) => `
							<li>
								${highlight(searchTerm, htmlEscape(r.lineText.trim()))}
							</li>
						`).join('\n')}</ul>
					</li>
				`);
				if(deDupeResults.length < 10){
					if(searchTerm !== this.searchTerm){
						return resolve();
					}
					this.dom.results.appendChild(fileResultsEl);
					return resolve();
				}
				window.requestAnimationFrame(async () => {
					if(searchTerm !== this.searchTerm){
						return resolve();
					}
					this.dom.results.appendChild(fileResultsEl)
					setTimeout(function() {
							resolve();
					}, 0);
				});
			});
		}
	}
	updateSummary({ allMatches, time, searchTerm, loading }){
		if(loading){
			this.dom.summary.innerHTML = '';
			return;
		}
		if(!allMatches || !allMatches.length){
			this.dom.summary.innerHTML = 'No results';
			return;
		}
		const totalFiles = unique(allMatches.map(x=>x.docName))
			.map(x => ({
				filename: x,
				results: []
			}));
		const pluralRes = allMatches.length > 1 ? "s" : ''
		const pluralFile = totalFiles.length > 1 ? "s" : ''
		this.dom.summary.innerHTML = `${allMatches.length} result${pluralRes} in ${totalFiles.length} file${pluralFile}, ${time.toFixed(2)} ms`;
	}
}



const getMatches = (theDoc, searchTerm, overlap) => {
	if(typeof theDoc.code !== "string") return [];

	const stringIndexAll = (str, term, overlap) => {
		var indices = [];
		for(var i=0; i<str.length;i++) {
			i = str.toLowerCase().indexOf(term.toLowerCase(), i);
			if(i === -1) break;
			indices.push(i);
			if(!overlap & term.length > 1) i+= (term.length-1)
		}
		return indices
	};
	const getLineResults = (all, lineText, lineNumber) => {
		const columns = stringIndexAll(lineText, searchTerm);
		columns.forEach(colNumber => {
			all.push({
				lineNumber,
				colNumber,
				lineText,
				docName: theDoc.name
			});
		});
		return all;
	};
	const matches = theDoc.code.split('\n').reduce(getLineResults, []);
	return matches;
};

const gangsterSearch = async (searchTerm, service) => {
	const MAX_RESULTS = 10000;
	const files = service.code;
	let allMatches = [];
	for(var k=0; k < files.length; k++){
		const theDoc = files[k];
		allMatches = [...allMatches, ...getMatches(theDoc, searchTerm)];
		if(allMatches.length >= MAX_RESULTS){
			allMatches = allMatches.slice(0, MAX_RESULTS);
			break;
		}
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
	const searchTerm = "provid" + "er";
	const path = './.welcome'

	await appendUrls(deps.filter(x => {
		return useFlexSearch
			? true
			: !x.includes('flexsearch');
	}));
	
	const searchBox = new SearchBox({});
	searchBox.updateTerm(searchTerm);
	searchBox.updateInclude(path)
	searchBox.searchStream({ term: searchTerm, include: path })
	return
	
	/*
	const t1 = performance.now();
	const exampleService = (await (await fetch('../../service/read/778')).json()).result[0];

	var index = useFlexSearch && await flexSearchIndex(exampleService);
	const search = async (term) => {
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
	*/

})();
