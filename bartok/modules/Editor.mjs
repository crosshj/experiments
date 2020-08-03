import Editor from '../../shared/modules/editor.mjs';
import EditorTabs from './EditorTabs.mjs';
import { attachListener, ChangeHandler, CursorActivityHandler } from './events/editor.mjs';
import ext from '../../shared/icons/seti/ext.json.mjs'

import { getCodeFromService } from './state.mjs'

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
		//console.log({ line, col });
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
	//console.log({ mode });


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
		console.log('this should have happneed');
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
			widget: (from, to) => { return '...'; },
			minFoldSize: 3
		}
	}, (error, editor) => {
		if(error){
			console.log(error);
			return;
		}
		editor.setOption("theme", darkEnabled ? "vscode-dark" : "default");
		window.Editor = editor;
		editor.on('change', handlerBoundToDoc);
		editor.on("cursorActivity", onCursorActivity);
		editor.on("scrollCursorIntoView", onScrollCursor)
		editor.setOption("styleActiveLine", { nonEmpty: true });
		editor.setOption("extraKeys", extraKeys);
	});
}

const showFileInEditor = (filename, contents) => {
	const fileType = getFileType(filename);
	return !['image', 'font'].includes(fileType);
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
	const extension = getExtension(fileName);
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
			}
		</style>
	`;
	if( fileType === 'image'){
		binaryPreview.innerHTML = style + `
			<img class="preview-image" src="${path}/${filename}">
		`;
	} else if (fileType === "audio"){
		binaryPreview.innerHTML = `
			<figure>
				<figcaption>${filename}</figcaption>
				<audio
					controls
					src="${path}/${filename}"
				>
					Your browser does not support the
					<code>audio</code> element.
				</audio>
			</figure>
		`;
	} else if (fileType === "video") {
		binaryPreview.innerHTML = `
			<video controls width="250">
				<source
					src="${path}/${filename}"
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
	let editorPreview, editorDom;

	attachListener((filename) => {
		const { code = "error", name, id, filename: defaultFile } = getCodeFromService(null, filename);
		if(!showFileInEditor(filename, code)){
			editor({ code: '', name, id, filename: filename || defaultFile });
			editorDom = document.querySelector('.CodeMirror');

			editorPreview = showBinaryPreview({ filename, code });
			editorPreview && editorPreview.classList.remove('hidden');
			editorDom && editorDom.classList.add('hidden');
			return;
		}

		editor({ code, name, id, filename: filename || defaultFile });
		editorDom = document.querySelector('.CodeMirror');

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
