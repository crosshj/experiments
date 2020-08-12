import Editor from '../../shared/modules/editor.mjs';
import EditorTabs from './EditorTabs.mjs';
import { attachListener, ChangeHandler, CursorActivityHandler } from './events/editor.mjs';
import ext from '../../shared/icons/seti/ext.json.mjs'

import { getCodeFromService , getState} from './state.mjs'

import { codemirrorModeFromFileType } from '../../shared/modules/utilities.mjs'

const getExtension = (fileName) => ((
	fileName.match(/\.[0-9a-z]+$/i) || []
)[0] || '').replace(/^\./, '');

function getFileType(fileName = '') {
	let type = 'default';
	const extension = getExtension(fileName);
	if (ext[extension]) {
		type = ext[extension];
	}
	if (extension === 'bat') {
		type = "bat";
	}
	if (extension === 'scratch') {
		type = "markdown";
	}
	if (extension === 'bugs') {
		type = "markdown";
	}
	if (extension === 'htm' || extension === 'html') {
		type = {
			name: "htmlmixed",
			mimeType: "application/x-ejs"
		};
	}
	return type;
}

//This is used by both List and inlineEditor
const Container = ({ operations }) => {
	const prevConatiner = document.querySelector("#full-page-container");
	if (prevConatiner) {
		prevConatiner.parentNode.removeChild(prevConatiner);
	}
	const containerDiv = document.createElement('div');
	const operationsItems = operations.map(x => `<li>${x}</li>`).join('\n');
	containerDiv.innerHTML = `
		<div class="editor-space hide-on-med-and-down"></div>
		<div class="contain">
			<ul class="editor-controls">
				${operationsItems}
			</ul>
		</div>
	`;
	containerDiv.classList.add('section', 'simulation', 'editor');
	containerDiv.id = "full-page-container";

	containerDiv.querySelector('.editor-controls')
		.addEventListener('click', e => {
			const operation = e.target.innerText;
			const event = new CustomEvent('operations', {
				bubbles: true,
				detail: {
					operation,
					body: {
						name: (containerDiv.querySelector('#service_name') || {}).value,
						id: (containerDiv.querySelector('#service_id') || {}).value,
						code: (window.Editor || { getValue: () => { } }).getValue()
					}
				}
			});
			document.body.dispatchEvent(event);
		});
	containerDiv.classList.add('section', 'simulation', 'editor');

	document.querySelector('#editor')
		.appendChild(containerDiv);
	return containerDiv;
};

const List = () => ({ services }) => {
	const containerDiv = Container({
		operations: ['read', 'manage', 'monitor', 'persist']
	});

	const listDiv = document.createElement('div');
	const servicesRows = services.map(s => (`
		<tr>
			<td class="table-checkbox">
				<label>
					<input type="checkbox" />
					<span></span>
				</label>
			</td>
			<td class="table-id">${s.id}</td>
			<td>${s.name}</td>
			<td data-id="${s.id}"><i class="material-icons">keyboard_arrow_right</i></td>
		</tr>
	`)).join('\n');
	listDiv.innerHTML = `
	<div class="container">
		<div class="row">
			<table class="highlight">
				<thead>
					<tr>
							<th class="table-checkbox">
								<label>
									<input type="checkbox" />
									<span></span>
								</label>
							</th>
							<th class="table-id">ID</th>
							<th>Name</th>
							<th></th>
					</tr>
				</thead>

				<tbody>
					${servicesRows}
				</tbody>
			</table>
		</div>
	</div>
	`;
	listDiv.classList.add('services-list');
	listDiv.addEventListener('click', e => {
		if (e.target.tagName.toLowerCase() !== 'i') {
			return;
		}
		const parent = e.target.parentNode;
		const event = new CustomEvent('operations', {
			bubbles: true,
			detail: {
				operation: 'read',
				body: parent.dataset
			}
		});
		document.body.dispatchEvent(event);
	});
	containerDiv.querySelector('.contain').appendChild(listDiv);
	return listDiv;
};

const Search = () => {
	const searchDiv = document.createElement('div');
	searchDiv.id = 'file-search';
	searchDiv.innerHTML = `
		<style>
			#file-search {
				visibility: hidden;
				position: absolute;
				background: var(--theme-subdued-color);
				z-index: 5;
				right: 0;
				width: 95%;
				height: 33px;
				max-width: 38em;
				box-shadow: 0 5px 3px 0px #000000;
				border-left: 3px solid var(--main-theme-background-color);
				display: flex;
				justify-content: space-between;
				align-items: center;
				cursor: default;
				margin-right: 0.65em;
			}
			.collapse-handle {
				width: 1.3em;
				text-align: center;
				font-stretch: expanded;
				font-family: monospace;
				font-size: 1.2em;
			}
			.search-field {
				margin-left: 0;
				flex: 1;
				height: 75%;
			}
			.search-field input {
				height: 100% !important;
				background: var(--main-theme-background-color) !important;
				margin: 0 !important;
				border: 0 !important;
				color: var(--main-theme-text-color);
				padding-left: .5em !important;
				padding-right: .5em !important;
				font-size: 1.1em !important;
				box-sizing: border-box !important;
				transition: unset !important;
			}
			.search-field input:focus {
				border: 1px solid !important;
				box-shadow: none !important;
				border-color: rgb(var(--main-theme-highlight-color)) !important;
			}
			.search-count,
			.search-no-results {
				margin-left: 0.5em;
				margin-right: auto;
				min-width: 5em;
			}
			.search-controls {
				margin-right: 1em;
				font-family: monospace;
				font-size: 1.1em;
				user-select: none;
			}
			.search-controls span {
				min-width: .8em;
				display: inline-block;
				cursor: pointer;
				text-align: center;
			}
			#file-search ::placeholder {
				color: var(--main-theme-text-invert-color);
			}
		</style>
		<div class="collapse-handle">></div>
		<div class="search-field">
			<input type="text" placeholder="Find" />
		</div>
		<div class="search-count hidden">
			<span class="search-count-current">X</span>
			<span>of</span>
			<span class="search-count-total">Y</span>
		</div>
		<span class="search-no-results">No results</span>
		<div class="search-controls">
			<span class="search-up">↑</span>
			<span class="search-down">↓</span>
			<span class="search-close">X</span>
		</div>
	`;
	return searchDiv;
};

/*
	NOTE:

	name ==> service name (parent of this file)
	id ==> service id
	filename ==> name of this file
*/

//const BLANK_CODE_PAGE = `${(new Array(99)).fill().join('\n')}`;
const BLANK_CODE_PAGE = '';
const inlineEditor = (ChangeHandler) => ({
	code=BLANK_CODE_PAGE,
	name,
	id,
	filename
} = {}) => {
	const prevEditor = document.querySelector('#editor-container');
	let editorDiv = prevEditor;
	if (!editorDiv) {
		const containerDiv = Container({
			operations: ['create', 'cancel', 'delete', 'persist', 'update']
		});
		editorDiv = document.createElement('div');
		editorDiv.id = "editor-container";
		editorDiv.innerHTML = `
			<div id="service-fields" class="row no-margin">
				<div class="input-field col s6">
					<input id="service_name" type="text" class="" value="${name}">
					<label for="service_name">Name</label>
				</div>
				<div class="input-field col s6">
					<input id="service_id" type="text" class="" value="${id}">
					<label for="service_id">ID</label>
				</div>
			</div>
		`;

		editorDiv.appendChild(EditorTabs(name
			? [{ name, active: true }]
			: undefined
		));

		editorDiv.appendChild(Search());

		const editorTextArea = document.createElement('textarea');
		editorTextArea.id = "service_code";
		editorTextArea.classList.add('functionInput');
		editorDiv.appendChild(editorTextArea);
		containerDiv.querySelector('.contain').appendChild(editorDiv);
	}

	window.M && M.updateTextFields();

	//const editorPane = document.querySelector('#editor');
	//editorPane.style.width = editorPane.clientWidth + 'px';
	const darkEnabled = window.localStorage.getItem('themeDark') === "true";
	const handlerBoundToDoc = ChangeHandler({ code, name, id, filename });

	var currentHandle = null, currentLine;
	function updateLineInfo(cm, line) {
		var handle = cm.getLineHandle(line - 1);
		if (handle == currentHandle && line == currentLine) return;
		if (currentHandle) {
			cm.removeLineClass(currentHandle, null, null);
			//cm.clearGutterMarker(currentHandle);
		}
		currentHandle = handle;
		currentLine = line;
		cm.addLineClass(currentHandle, null, "activeline");
		//cm.setGutterMarker(currentHandle, String(line + 1));
	}

	const onCursorActivity = (instance) => {
		const cursor = instance.getCursor();
		const line = cursor.line + 1;
		const column = cursor.ch + 1;
		updateLineInfo(instance, line);
		// STATUS_CURRENT_LINE.textContent = cursor.line + 1;
		CursorActivityHandler({ line, column });
	};

	const onScrollCursor = (instance, event) => {
		//TODO: use this to recall scroll positions?
		//event.preventDefault();
	};

	//TODO: code should come from changeHandler if it exists

	const fileType = getFileType(filename);
	const mode = codemirrorModeFromFileType(fileType);

	function isSelectedRange(ranges, from, to) {
		for (var i = 0; i < ranges.length; i++)
			if (CodeMirror.cmpPos(ranges[i].from(), from) == 0 &&
				CodeMirror.cmpPos(ranges[i].to(), to) == 0) return true
		return false
	}
	function selectNextOccurrence(cm) {
		var Pos = CodeMirror.Pos;

		var from = cm.getCursor("from"), to = cm.getCursor("to");
		var fullWord = cm.state.sublimeFindFullWord == cm.doc.sel;
		if (CodeMirror.cmpPos(from, to) == 0) {
			var word = wordAt(cm, from);
			if (!word.word) return;
			cm.setSelection(word.from, word.to);
			fullWord = true;
		} else {
			var text = cm.getRange(from, to);
			var query = fullWord ? new RegExp("\\b" + text + "\\b") : text;
			var cur = cm.getSearchCursor(query, to);
			var found = cur.findNext();
			if (!found) {
				cur = cm.getSearchCursor(query, Pos(cm.firstLine(), 0));
				found = cur.findNext();
			}
			if (!found || isSelectedRange(cm.listSelections(), cur.from(), cur.to())) return
			cm.addSelection(cur.from(), cur.to());
		}
		if (fullWord) {
			cm.state.sublimeFindFullWord = cm.doc.sel;
		}
		return false;
	}
	const extraKeys = {
		"Cmd-D": selectNextOccurrence,
		"Ctrl-D": selectNextOccurrence
	};

	if(!code){
		return;
	}

	Editor({
		text: code,
		lineNumbers: true,
		mode,
		addModeClass: true,
		autocorrect: true,
		// scrollbarStyle: 'native',
		tabSize: 2,
		//indentWithTabs: true,
		showInvisibles: true,
		styleActiveLine: true,
		styleActiveSelected: true,
		matchBrackets: true,
		lineWrapping: true,
		scrollPastEnd: true,
		foldGutter: true,
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		foldOptions: {
			widget: (from, to) => {
				return '...';
			},
			minFoldSize: 3
		}
	}, (error, editor) => {
		if(error){
			console.error(error);
			return;
		}
		editor.setOption("theme", darkEnabled ? "vscode-dark" : "default");
		window.Editor = editor;
		editor.on('change', handlerBoundToDoc);
		editor.on("cursorActivity", onCursorActivity);
		editor.on("scrollCursorIntoView", onScrollCursor)
		editor.setOption("styleActiveLine", { nonEmpty: true });
		editor.setOption("extraKeys", extraKeys);

		let editorState = {
			unfolded: [],
			scroll: 0
		};
		const stateStorageKey = `state::${name}::${filename}`;
		try {
			const storedState = JSON.parse(sessionStorage.getItem(stateStorageKey));
			if(storedState && storedState.unfolded){
				editorState = storedState;
			}
		} catch(e) {}

		editor.on('fold', (cm, from, to) => {
			cm.addLineClass(from.line, 'wrap', 'folded')
		});
		editor.on('unfold', (cm, from, to) => {
			cm.removeLineClass(from.line, 'wrap', 'folded')
		});

		let cursor = 0;
		editor.eachLine(editor.firstLine(), editor.lastLine(), function(line) {
			// todo: store these exceptions in user config?
			const shouldNotFold = [
				'<html>',
				'<head>',
				'<svg',
				'<!--',
				'code_in',
				"# welcome!"
			].find(x => line.text.includes(x));

			const isfirstLineOfJSON = (
				filename.includes('.json') ||
				filename.includes('.gltf') ||
				filename.includes('.ipynb')
			) && cursor === 0;

			if(shouldNotFold || isfirstLineOfJSON){
				cursor++;
				return;
			}
			// children of the folded
			const alreadyFolded = editor.isFolded({ line: cursor, ch: 0 });
			if(alreadyFolded){
				cursor++;
				return;
			}

			editor.foldCode({line: cursor, ch: 0}, null, "fold");
			cursor++;
		});

		editorState.unfolded.forEach(line => editor.foldCode({line, ch: 0}, null, "unfold"));

		editor.on('fold', (cm, from, to) => {
			editorState.unfolded = editorState.unfolded.filter(x => x !== from.line);
			sessionStorage.setItem(stateStorageKey, JSON.stringify(editorState));
		});

		editor.on('unfold', (cm, from, to) => {
			if(editorState.unfolded.includes(from.line)){
				return;
			}
			editorState.unfolded.push(from.line);
			sessionStorage.setItem(stateStorageKey, JSON.stringify(editorState));
		});

	});
}

let nothingOpen;
const showNothingOpen = () => {
	if(!nothingOpen){
		const editorContainer = document.getElementById('editor-container');
		nothingOpen = document.createElement('div');
		nothingOpen.id = 'editor-empty';
		editorContainer.appendChild(nothingOpen);
	}
	const style = `
		<style>
			#editor-empty {
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				background: #1e1e1e;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				overflow: hidden;
				min-width: 160px;
			}
			#editor-empty-logo {
				opacity: .5;
				color: rgb(var(--main-theme-highlight-color));
				fill: currentColor;
				width: 18em;
				margin-top: -14em;
				stroke: rgba(var(--main-theme-highlight-color),.4);
			}
			.editor-empty-blurb {
				/* visibility: hidden; */
				font-variant: small-caps;
				font-style: italic;
				color: var(--main-theme-text-color);
			}
		</style>
	`;
	// const logo = `
	// <svg viewBox="17 -4 164 164" id="editor-empty-logo">
	// 	<g display="inline">
	// 		<path d="m107.92716,36.94508l0.95003,75.70511q0.43081,20.89989 -8.2886,28.93939a17.79142,17.79142 0 0 1 -5.62624,3.50444a26.0076,26.0076 0 0 1 -9.05414,1.83369a25.65472,25.65472 0 0 1 -5.99571,-0.53686a17.93757,17.93757 0 0 1 -7.97647,-3.87325q-5.37316,-4.58798 -5.51145,-11.29708a8.56719,8.56719 0 0 1 0.46363,-3.06124a7.69904,7.69904 0 0 1 1.7347,-2.78065a8.1837,8.1837 0 0 1 2.21745,-1.6709a7.12818,7.12818 0 0 1 3.1023,-0.75751q3.04976,-0.06286 5.31721,1.90423a6.54734,6.54734 0 0 1 2.31551,4.69287a8.41542,8.41542 0 0 1 0.01667,0.38455a9.9962,9.9962 0 0 1 -0.17825,2.17434q-0.33206,1.6539 -1.27337,2.88173a6.44928,6.44928 0 0 1 -0.02982,0.03873a6.49737,6.49737 0 0 1 -1.61735,1.50169a5.69668,5.69668 0 0 1 -2.23968,0.83533a7.63846,7.63846 0 0 0 1.94997,2.72157a9.66705,9.66705 0 0 0 0.86605,0.69883a7.27496,7.27496 0 0 0 3.49986,1.31186a9.52902,9.52902 0 0 0 1.25767,0.05468q2.77495,-0.0572 4.58481,-1.07112q1.39415,-0.78104 2.3667,-2.67558a12.1472,12.1472 0 0 0 0.54265,-1.22836q1.81667,-4.68495 1.74149,-18.0017a214.86231,214.86231 0 0 0 -0.04299,-3.207l-0.95065,-75.70447q-0.2388,-11.58509 2.8317,-18.91706a19.04305,19.04305 0 0 1 11.19336,-11.14967a26.89948,26.89948 0 0 1 9.05539,-1.77311a24.95083,24.95083 0 0 1 6.1505,0.58928a18.02376,18.02376 0 0 1 7.73051,3.82333a16.27309,16.27309 0 0 1 3.72013,4.41961a14.41251,14.41251 0 0 1 1.8213,6.87685a8.56719,8.56719 0 0 1 -0.46363,3.06124a7.69904,7.69904 0 0 1 -1.7347,2.78065a8.1837,8.1837 0 0 1 -2.21745,1.6709a7.12818,7.12818 0 0 1 -3.1023,0.75751q-3.04914,0.06285 -5.31721,-1.90423a7.78648,7.78648 0 0 1 -1.33237,-1.46589a5.40563,5.40563 0 0 1 -0.98662,-3.00135a12.54318,12.54318 0 0 1 0.128,-2.15644q0.18065,-1.17841 0.60929,-2.11824a5.89841,5.89841 0 0 1 0.91456,-1.4341q1.65528,-1.90487 3.17664,-2.18304a2.98293,2.98293 0 0 1 0.13391,-0.02088q-1.98924,-4.71772 -6.65943,-4.90888a9.93998,9.93998 0 0 0 -0.61184,-0.00613q-5.15393,0.10624 -7.30488,5.27607q-2.07951,4.99841 -1.8924,17.5918a151.92781,151.92781 0 0 0 0.01553,0.87445z"
	// 		/>
	// 		<path d="m100.36909,153.77804q-20.74665,0 -38.19824,-10.25128q-17.45159,-10.25128 -27.82491,-27.82491q-10.37332,-17.57363 -10.37332,-38.32027q0,-20.50257 10.37332,-38.0762q10.37332,-17.57363 27.82491,-27.82491q17.45159,-10.25128 38.19824,-10.25128q20.50257,0 37.95416,10.37332q17.45159,10.37332 27.70287,27.82491q10.25128,17.45159 10.25128,37.95416q0,20.74665 -10.25128,38.32027q-10.25128,17.57363 -27.70287,27.82491q-17.45159,10.25128 -37.95416,10.25128zm0,-4.39341q19.28218,0 35.75745,-9.64109q16.47528,-9.64109 26.11637,-26.2384q9.64109,-16.59732 9.64109,-36.12357q0,-19.52625 -9.64109,-36.00153q-9.64109,-16.47528 -26.11637,-26.11637q-16.47528,-9.64109 -35.75745,-9.64109q-19.52625,0 -36.12357,9.64109q-16.59732,9.64109 -26.2384,26.11637q-9.64109,16.47528 -9.64109,36.00153q0,19.52625 9.64109,36.12357q9.64109,16.59732 26.2384,26.2384q16.59732,9.64109 36.12357,9.64109z"
	// 		/>
	// 	</g>
	// </svg>
	// `;
	const logo = `
	<svg viewBox="-4 -4 172 150" id="editor-empty-logo">
		<g>
			<title>final</title>
			<path d="m0.66613,141.12654l40.94759,-22.96759l39.55286,22.95911l-80.50045,0.00848z" stroke="#000000" stroke-width="0" opacity=".3"></path>
			<path d="m81.32664,141.18317l41.77172,-23.74405l40.66986,23.45933l-82.44158,0.28472z" stroke-width="0" opacity=".1"></path>
			<path d="m-8.80672,124.5856l39.68109,-24.32103l39.94988,23.98956l-79.63097,0.33147z" stroke-width="0" transform="rotate(120.005 31.0088 112.425)" opacity=".15"></path>
			<path d="m29.8517,54.08169l40.95021,-23.76637l41.15387,23.42957l-82.10408,0.3368z" stroke-width="0" transform="rotate(120.005 70.9037 42.1985)" opacity=".15"></path>
			<path d="m50.84794,54.21713l41.14723,-23.71165l40.66986,23.126l-81.81709,0.58565z" stroke-width="0" transform="rotate(240.005 91.7565 42.3613)" opacity=".5"></path>
			<path d="m92.34289,123.94524l40.84106,-24.40053l40.54568,23.11973l-81.38674,1.2808z" stroke-width="0" transform="rotate(240.005 133.036 111.745)" opacity=".35"></path>

			<path id="border" d="m80.7229,0.44444l82.61043,140.55521l-163.22223,0.44479l80.6118,-141z" fill="none" stroke-width="1"></path>

			<path d="m80.63317,96.1755l0.39079,45.37696l41.8002,-23.91294l-0.6859,-46.06544l-41.50509,24.60142z" stroke-width="0" opacity=".25"></path>
			<path d="m60.24695,60.10716l0.41626,47.48081l41.25377,-23.26463l-0.93192,-47.77411l-40.73811,23.55793z" stroke-width="0" transform="rotate(60 81.082 72.0686)" opacity=".67"></path>
			<path d="m41.52036,94.93062l-0.5376,46.74648l39.55956,-24.26797l-0.06849,-45.66349l-38.95347,23.18498z" stroke-width="0" transform="rotate(120 60.7625 106.711)" opacity=".55"></path>
		</g>
	</svg>
	`
	nothingOpen.innerHTML = style + logo + '<div class="editor-empty-blurb"><p>All models are wrong.</p><p style="margin-top:-10px;">Some models are useful.</p></div>';
	return nothingOpen;
};

const showFileInEditor = (filename, contents) => {
	const fileType = getFileType(filename);
	return !['image', 'font', 'audio', 'video'].includes(fileType);
}

let binaryPreview;
const showBinaryPreview = ({
	filename, path="."
} = {}) => {
	if(!binaryPreview){
		const editorContainer = document.getElementById('editor-container');
		binaryPreview = document.createElement('div');
		binaryPreview.id = 'editor-preview';
		editorContainer.appendChild(binaryPreview);
	}

	const state = getState();
	let url;
	try{
		url = state.paths
			.find(x => x.name === filename)
			.path
			.replace('/welcome/', '/.welcome/')
			.replace(/^\//, './');
	} catch(e){}

	const extension = getExtension(filename);
	const fileType = getFileType(filename);
	const style = `
		<style>
			#editor-preview {
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				padding-bottom: 30%;
				font-size: 2em;
				color: var(--main-theme-text-invert-color);
			}
			#editor-preview .preview-image {
				min-width: 50%;
				image-rendering: pixelated;
				object-fit: contain;
				margin-bottom: -20%;
				padding: 0.7em;
			}
			audio {
				filter: invert(0.7) contrast(1.5);
			}
			audio:focus {
				outline: 0;
				border: 1px solid #444;
				border-radius: 50px;
			}
			video {
				max-width: 95%;
			}
		</style>
	`;
	if( fileType === 'image'){
		binaryPreview.innerHTML = style + `
			<img class="preview-image" src="${url}">
		`;
	} else if (fileType === "audio"){
		binaryPreview.innerHTML = style + `
			<figure>
			<audio
				controls
				loop
				autoplay
				controlsList="play timeline volume"
				src="${url}"
			>
				Your browser does not support the
				<code>audio</code> element.
			</audio>
			</figure>
		`;
	} else if (fileType === "video") {
		binaryPreview.innerHTML = style + `
			<video
				controls
				loop
				autoplay
				controlsList="play timeline volume"
				disablePictureInPicture
			>
				<source
					src="${url}"
					type="video/${extension}"
				>
				Sorry, your browser doesn't support embedded videos.
			</video>
		`;
	} else {
		binaryPreview.innerHTML = style + `
			<pre>Unsupported File Type</pre>
		`;
	}
	return binaryPreview;
};

function _Editor() {
	const editor = inlineEditor(ChangeHandler);
	let editorPreview, editorDom, nothingOpenDom;

	attachListener((filename, mode) => {
		if(mode === "nothingOpen"){
			//TODO: does this HAVE to be ran in this case?
			editor({ code: '', name: '', id: '', filename: '' });
			editorDom = document.querySelector('.CodeMirror');

			nothingOpenDom = showNothingOpen();
			nothingOpenDom && nothingOpenDom.classList.remove('hidden');

			editorPreview && editorPreview.classList.add('hidden');
			editorDom && editorDom.classList.add('hidden');
			return;
		}

		const { code = "error", name, id, filename: defaultFile } = getCodeFromService(null, filename);

		if(!showFileInEditor(filename, code)){
			editor({ code: '', name, id, filename: filename || defaultFile });
			editorDom = document.querySelector('.CodeMirror');

			editorPreview = showBinaryPreview({ filename, code });
			editorPreview && editorPreview.classList.remove('hidden');

			nothingOpenDom && nothingOpenDom.classList.add('hidden');
			editorDom && editorDom.classList.add('hidden');
			return;
		}

		editor({ code, name, id, filename: filename || defaultFile });
		editorDom = document.querySelector('.CodeMirror');

		nothingOpenDom && nothingOpenDom.classList.add('hidden');
		editorPreview && editorPreview.classList.add('hidden');
		editorDom && editorDom.classList.remove('hidden');
	});

	//deprecate
	return {
		inlineEditor: editor,
		List: List()
	}
}

export default _Editor;
