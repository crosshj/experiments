import { attach } from '../Listeners.mjs';

import ext from '../../../shared/icons/seti/ext.json.mjs';


let tree;

function getDefaultFile(service){
	let defaultFile;
	try {
		const packageJson = JSON.parse(
			service.code.find(x => x.name === "package.json").code
		);
		defaultFile = packageJson.main;
	} catch(e){
		//debugger;
	}
	return defaultFile || "index.js";
}

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
	if(extension === 'md'){
		type = 'info';
	}
	return type;
}


const fileSelectHandler = (e) => {
	const { name, next } = e.detail;
	if(e.type === "fileClose" && !next){
		return;
	}

	Array.from(
		document.querySelectorAll('#tree-view .selected')||[]
	)
		.forEach(x => x.classList.remove('selected'));

	const leaves = Array.from(
		document.querySelectorAll('#tree-view .tree-leaf-content')||[]
	);
	const found = leaves.find(x => {
		return x.innerText.includes(next || name);
	});
	if(found){
		found.classList.add('selected')
	}
}

const fileChangeHandler = (updateTree) => (event) => {
	const { name, id, file } = event.detail;
	updateTree('dirty', {name, id, file});
};


const getTree = (result) => {
	let resultTree = {
		"index.js": {}
	};

	if(result && result[0] && result[0].tree){
		return result[0].tree;
	}

	const name = ((result||[])[0]||{}).name || 'no service name';

	try {
		resultTree = { [name]: resultTree };
		resultTree[name] = JSON.parse(result[0].tree);
	} catch(e){
		console.log('error parsing file tree');
	}

	return resultTree;
};

const fileTreeConvert = (input, converted=[]) => {
	const keys = Object.keys(input);
	keys.forEach(k => {
		converted.push({
			name: k,
			children: fileTreeConvert(input[k])
		})
	});
	return converted.sort((a, b) => {
		if(a.name < b.name) { return -1; }
    if(a.name > b.name) { return 1; }
    return 0;
	});
};

const treeMenu = ({ title }) => {
	const treeMenu = document.querySelector('#explorer #tree-menu');
	const menuInnerHTML = `
		<div class="title-label">
			<h2 title="${title}">${title}</h2>
		</div>
		<div class="title-actions">
			<div class="monaco-toolbar">
					<div class="monaco-action-bar animated">
						<ul class="actions-container">
								<li class="action-item">
									<a class="action-label icon explorer-action new-file" role="button" tabindex="0" title="New File">
									</a>
								</li>
								<li class="action-item">
									<a class="action-label icon explorer-action new-folder" role="button" tabindex="0" title="New Folder">
									</a>
								</li>
								<li class="action-item">
									<a class="action-label icon explorer-action refresh-explorer" role="button" tabindex="0" title="Refresh Explorer">
									</a>
								</li>
								<li class="action-item">
									<a class="action-label icon explorer-action collapse-explorer" role="button" tabindex="0" title="Collapse Folders in Explorer">
									</a>
								</li>
						</ul>
					</div>
			</div>
		</div>
	`;
	treeMenu.innerHTML = menuInnerHTML;
}

//TODO: code that creates a tree should live in ../TreeView and be passed here!!
function attachListener(treeView, JSTreeView, updateTree){
	const listener = async function (e) {
		const { id, result } = e.detail;
		//console.log(e.detail);
		if(result.length > 1){
			return; // TODO: this is right???
		}
		if(tree && tree.id === id){
			return;
		}
		const currentExplorer = document.querySelector('#explorer');
		const backupStyle = {
			minWidth: currentExplorer.style.minWidth,
			maxWidth: currentExplorer.style.maxWidth,
			width: currentExplorer.style.width,
			clientWidth: currentExplorer.clientWidth
		};
		//currentExplorer.style.width = currentExplorer.clientWidth;
		currentExplorer.style.minWidth = currentExplorer.clientWidth + 'px';

		if(tree && tree.id !== id){
			tree.off();
			tree = undefined;
		}
		const treeFromResult = getTree(result);
		const converted = fileTreeConvert(treeFromResult);
		converted[0].expanded = true;

		const projectName = converted[0].name;
		treeMenu({ title: projectName });

		const children = converted[0].children;

		const newTree = new JSTreeView(children, 'tree-view');
		newTree.id = id;

		newTree.on('select', function (e) {
			// try{
			// 	const currentParent = e.target.target.parentNode;
			// 	if(currentParent.classList.contains('selected')){
			// 		return;
			// 	}
			// 	Array.from(document.querySelectorAll('#tree-view .selected')||[])
			// 		.forEach(x => x.classList.remove('selected'));
			// 	currentParent.classList.add('selected');
			// } catch(e) {
			// 	console.error(e);
			// 	console.error('could not mark leaf as selected');
			// }
			if(e.data.children.length > 1){
				return;
			}
			let changed;
			try {
				changed = e.target.target.parentNode.classList.contains('changed')
			} catch(e){}

			const event = new CustomEvent('fileSelect', {
				bubbles: true,
				detail: {
					name: e.data.name,
					changed
				}
			});
			document.body.dispatchEvent(event);
		});

		//console.log('----- TREE');
		// this happens when: switch/open project, add file, ...
		const defaultFile = getDefaultFile(result[0]);
		Array.from(treeView.querySelectorAll('.tree-leaf-content')).forEach(t => {
			const item = JSON.parse(t.dataset.item);
			if(item.children.length){
				t.classList.add('folder');
			} else {
				const textNode = t.querySelector('.tree-leaf-text');
				textNode.classList.add(`icon-${getFileType(textNode.innerText)}`);
			}
			if(item.name === defaultFile){
				t.classList.add('selected');
			}
		});

		tree = newTree;
		// setTimeout(() => {
			//currentExplorer.style.width = backupStyle.clientWidth;
			//currentExplorer.style.minWidth = backupStyle.minWidth;
		// }, 1000)
	};
	attach({
		name: 'TreeView',
		eventName: 'operationDone',
		listener
	});
	attach({
		name: 'TreeView',
		eventName: 'fileSelect',
		listener: fileSelectHandler
	});
	attach({
		name: 'TreeView',
		eventName: 'fileClose',
		listener: fileSelectHandler
	});
	attach({
		name: 'TreeView',
		eventName: 'fileChange',
		listener: fileChangeHandler(updateTree)
	});
}


export {
	attachListener
};
