import Editor from '../../shared/modules/editor.mjs';
import TreeView from './TreeView.mjs';
import Terminal from './Terminal.mjs';
import Panes from './panes.mjs';

import { attachListener } from './events/editor.mjs';

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

const List = ({ services }) => {
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

const inlineEditor = ({ code, name, id }={}) => {
	TreeView();
	const containerDiv = Container({
		operations: ['create', 'cancel', 'delete', 'persist', 'update']
	});

	const editorDiv = document.createElement('div');
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
			<div id="editor-tabs" class="row no-margin">
				<div class="tab">
					<span>index.js</span>
				</div>
			</div>
			<textarea class="functionInput" id="service_code"></textarea>
	`;

	containerDiv.querySelector('.contain').appendChild(editorDiv);
	M.updateTextFields();

	const editorPane = document.querySelector('#editor');
	editorPane.style.width = editorPane.clientWidth + 'px';
	const darkEnabled = window.localStorage.getItem('themeDark') === "true";
	Editor({
			text: code,
			lineNumbers: true,
			mode:  "javascript",
			styleActiveLine: true,
			matchBrackets: true
	}, (error, editor) => {
			editor.setOption("theme", darkEnabled ? "vscode-dark" : "default");
			window.Editor = editor;
	});
}

let currentService;
let currentFile;
function getCodeFromService(service, file){
	if(!service){
		service = currentService || {};
	} else {
		currentService = service;
	}
	if(!file){
		currentFile = currentFile || "index.js";
		file = currentFile;
	} else {
		currentFile = file;
	}
	const code = Array.isArray(service.code)
		? (service.code.find(x => x.name === file)||{}).code || ""
		: service.code;
	return {
		code,
		name: service.name,
		id: service.id
	};
}

attachListener((currentFile) => {
	console.log('TODO: switch or add tab');
	console.log('TODO: changes to current file')
	const { code="error", name, id } = getCodeFromService(null, currentFile);
	inlineEditor({ code, name, id });
});

async function bartok(){
	const readAfter = ({ result = {} } = {}) => {
		const services = result.result;
		if(services.length && !services[0].code){
			result.listOne = true;
		}
		if(services.length > 1 || result.listOne){
			document.querySelector('#project-splitter')
				.style.display = "none";
			List({ services });
		} else {
			document.querySelector('#project-splitter')
				.style.display = "";
			const service = services[0];
			if(!service){
				return inlineEditor({ code:"", name:"", id:"" });
			}
			const { code, name, id } = getCodeFromService(services[0]);
			inlineEditor({ code, name, id });
		}
	};
	const updateAfter = ({ result }) => {
		const services = result.result;
		const { code, name, id } = getCodeFromService(services[0]);
		inlineEditor({ code, name, id });
	};
	const operations = [{
			url: ''
		}, {
			name: 'create',
			url: 'service/create',
			config: {
				method: 'POST',
				name: 'test-service',
				body: {
					name: 'test-service'
				}
			}
		}, {
			name: 'read',
			url: 'service/read/{id}',
			after: readAfter
		}, {
			name: 'update',
			url: 'service/update',
			config: {
				method: 'POST'
			},
			after: updateAfter
		}, {
			name: 'delete',
			url: 'service/delete',
			config: {
				method: 'POST'
			},
			after: readAfter
		}, {
			name: 'manage',
			url: 'manage'
		}, {
			name: 'monitor',
			url: 'monitor'
		}, {
			name: 'persist',
			url: 'persist'
	}];

	operations.forEach(x => {
		x.url = `http://localhost:3080/${x.url}`;
		if(x.config && x.config.body){
			x.config.body = JSON.stringify(x.config.body);
		}
	});

	async function performOperation(operation, eventData = {}) {
		const { body={}, after } = eventData;
		const { id } = body;
		const op = JSON.parse(JSON.stringify(operation));
		op.after = after || operation.after;
		op.url = op.url.replace('{id}', id || '');
		op.config = op.config || {};
		op.config.headers = {...{
      'Accept': 'application/json',
      'Content-Type': 'application/json'
		}, ...((op.config||{}).headers||{})};
		if(op.config.method !== "POST"){
			delete op.config.body;
		}
		const response = await fetch(op.url, op.config);
		const result = await response.json();
		if (op.after) {
			op.after({ result });
		}
		const event = new CustomEvent('operationDone', {
			bubbles: true,
			detail: {
				op: operation.name,
				id,
				result: result.result
			}
		});
		document.body.dispatchEvent(event);
		//console.log({ operation, data });
	}

	document.body.addEventListener('operations', async function (e) {
		// console.log(e.detail);
		const eventOp = e.detail.operation;
		if(eventOp === 'cancel'){
			const foundOp = operations.find(x => x.name === 'read');
			performOperation(foundOp, { body: { id: '' } });
			return
		}
		if(eventOp === 'update'){
			console.log({ currentService});
			const files = JSON.parse(JSON.stringify(currentService.code));
			//debugger;
			(files.find(x => x.name === currentFile)||{})
				.code = e.detail.body.code;
			e.detail.body.code = JSON.stringify({
				tree: currentService.tree,
				files
			});
		}
		const foundOp = operations.find(x => x.name === eventOp)
		foundOp.config = foundOp.config || {};
		//foundOp.config.body = foundOp.config.body ? JSON.parse(foundOp.config.body) : undefined;
		foundOp.config.body = JSON.stringify(e.detail.body);
		await performOperation(foundOp, e.detail);
		e.detail.done && e.detail.done('DONE\n')
	}, false);

	//do everything once the first time
	// for(var i=0, len= operations.length; i<len; i++){
	// 	const operation = operations[i];
	// 	await performOperation(operation);
	// }

	const foundOp = operations.find(x => x.name === 'read');
	await performOperation(foundOp, { body: { id: 11 } });
	Terminal();
}

function splitPanes(){
	Panes();
	bartok();
}

export default splitPanes;
