import Editor from '../../shared/modules/editor.mjs';
import EditorTabs from './EditorTabs.mjs';
import { attachListener, ChangeHandler } from './events/editor.mjs';
import ext from '../../shared/icons/seti/ext.json.mjs'

import { codemirrorModeFromFileType } from '../../shared/modules/utilities.mjs'

function getFileType(fileName=''){
	let type = 'default';
	const extension = ((
			fileName.match(/\.[0-9a-z]+$/i) || []
		)[0] ||''
	).replace(/^\./, '');

	//console.log(extension)
	if(ext[extension]){
		type=ext[extension];
	}
	if(extension === 'bat'){
		type = "bat";
	}
	if(extension === 'scratch'){
		type = "markdown";
	}
	if(extension === 'bugs'){
		type = "markdown";
	}
	return type;
}

//This is used by both List and inlineEditor
const Container = ({ operations }) => {
	const prevConatiner = document.querySelector("#full-page-container");
	if(prevConatiner){
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
						name: (containerDiv.querySelector('#service_name')||{}).value,
						id: (containerDiv.querySelector('#service_id')||{}).value,
						code: (window.Editor||{ getValue: ()=>{}}).getValue()
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

const List = (TreeView) => ({ services }) => {
	TreeView("hide");
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
			if(e.target.tagName.toLowerCase() !== 'i'){
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

const inlineEditor = (TreeView, ChangeHandler) => ({ code, name, id, filename }={}) => {
	TreeView();

	const prevEditor = document.querySelector('#editor-container');
	let editorDiv = prevEditor;
	if(!editorDiv){
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
			?[{ name, active: true }]
			: undefined
		));

		const editorTextArea = document.createElement('textarea');
		editorTextArea.id = "service_code";
		editorTextArea.classList.add('functionInput');
		editorDiv.appendChild(editorTextArea);
		containerDiv.querySelector('.contain').appendChild(editorDiv);
	}

	M.updateTextFields();

	//const editorPane = document.querySelector('#editor');
	//editorPane.style.width = editorPane.clientWidth + 'px';
	const darkEnabled = window.localStorage.getItem('themeDark') === "true";
	const handlerBoundToDoc = ChangeHandler({ code, name, id });

	var currentHandle = null, currentLine;
	function updateLineInfo(cm, line) {
		var handle = cm.getLineHandle(line-1);
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
		const col = cursor.ch + 1;
		updateLineInfo(instance, line);
		//console.log({ line, col });
		// STATUS_CURRENT_LINE.textContent = cursor.line + 1;
	};
	//TODO: code should come from changeHandler if it exists

	const fileType = getFileType(filename);
	const mode = codemirrorModeFromFileType(fileType);
	//console.log({ mode });

	Editor({
			text: code,
			lineNumbers: true,
			mode,
			styleActiveLine: true,
			styleActiveSelected: true,
			matchBrackets: true
	}, (error, editor) => {
			editor.setOption("theme", darkEnabled ? "vscode-dark" : "default");
			window.Editor = editor;
			editor.on('change', handlerBoundToDoc);
			editor.on("cursorActivity", onCursorActivity);
			editor.setOption("styleActiveLine", {nonEmpty: true})
	});
}

function getEditor({ getCodeFromService, TreeView } = {}){
	attachListener((filename) => {
		const { code="error", name, id } = getCodeFromService(null, filename);
		inlineEditor(TreeView, ChangeHandler)({ code, name, id, filename });
	});

	return {
		inlineEditor: inlineEditor(TreeView, ChangeHandler),
		List: List(TreeView)
	}
}

export default getEditor;
