import JSTreeView from "../../shared/vendor/js-treeview.1.1.5.js";
//import JSTreeView from "https://dev.jspm.io/js-treeview@1.1.5";

import { attachListener, connectTrigger } from './events/tree.mjs';

let treeView, opener;

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim(); // Never return a text node of whitespace as the result
	template.innerHTML = html;
	//also would be cool to remove indentation from all lines
	return template.content.firstChild;
}

const ProjectOpener = () => {
	let _opener = htmlToElement(`
		<div class="service-opener">
			<style>
				.service-opener > div {
					display: flex;
					flex-direction: column;
					padding: 0px 20px;
					margin-right: 17px;
				}
				.service-opener button {
					color: inherit;
					background: rgba(var(--main-theme-highlight-color), 0.4);
					font-size: 1.1em;
					border: 0;
					padding: 10px;
					margin-top: 3em;
					cursor: pointer;
				}
				.service-opener  p {
					white-space: normal;
					margin-bottom: 0;
				}
				.service-opener .opener-note {
					font-style: italic;
					opacity: 0.8;
				}
				.service-opener .opener-note:before {
					content: 'NOTE: '
				}
			</style>
			<div class="service-opener-actions">
				<p>You have nothing to edit. Pick an option below to get started.</p>
				<p class="opener-note">Your work will stay in this browser unless you arrange otherwise.</p>

				<button id="add-service-folder">Open Folder</button>
				<p>Upload from your computer into local browser memory.</p>

				<button id="connect-service-provider">Connect to a Provider</button>
				<p>Specify a service to read from and write to.</p>
			</div>
		</div>
	`);

	const openerActions = _opener.querySelector('.service-opener-actions');
	connectTrigger({
		eventName: 'add-service-folder',
		filter: e => openerActions.contains(e.target)
			&& e.target.tagName === "BUTTON"
			&& e.target.id === 'add-service-folder'
	});
	connectTrigger({
		eventName: 'connect-service-provider',
		filter: e => openerActions.contains(e.target)
			&& e.target.tagName === "BUTTON"
			&& e.target.id === 'connect-service-provider'
	});

	return _opener;
};

const TreeMenu = () => {
	const _treeMenu = document.createElement('div');
	_treeMenu.id="tree-menu";
	_treeMenu.classList.add("row", "no-margin");
	const menuInnerHTML = `
		<div class="title-label">
			<h2 title=""></h2>
		</div>
		<div class="title-actions">
			<div class="monaco-toolbar">
					<div class="monaco-action-bar animated">
						<ul class="actions-container">
								<li class="action-item hidden">
									<a class="action-label icon explorer-action new-file" role="button" title="New File">
									</a>
								</li>
								<li class="action-item hidden">
									<a class="action-label icon explorer-action new-folder" role="button" title="New Folder">
									</a>
								</li>
								<li class="action-item hidden">
									<a class="action-label icon explorer-action refresh-explorer" role="button" title="Refresh Explorer">
									</a>
								</li>
								<li class="action-item hidden">
									<a class="action-label icon explorer-action collapse-explorer" role="button" title="Collapse Folders in Explorer">
									</a>
								</li>
						</ul>
					</div>
			</div>
		</div>
	`;
	_treeMenu.innerHTML = menuInnerHTML;
	return _treeMenu;
};

const Search = () => {
	const search = document.createElement('div');
	const searchStyle = `
		<style>
		.tree-search {
			display: flex;
			flex-direction: column;
			padding: 0px 10px 0px 20px;
			margin-right: 17px;
			user-select: none;
		}
		.tree-search p {
			white-space: normal;
		}
		.tree-search input {
			background: var(--main-theme-background-color) !important;
			margin: 0 !important;
			border: 0 !important;
			color: var(--main-theme-text-color);
			padding-left: .5em !important;
			padding-right: .5em !important;
			font-size: 1.1em !important;
			box-sizing: border-box !important;
			padding-top: .25em !important;
			padding-bottom: .25em !important;
			height: unset !important;
			transition: unset !important;
			border: 1px solid !important;
			border-color: transparent !important;
		}
		.tree-search input:focus {
			box-shadow: none !important;
			border-color: rgb(var(--main-theme-highlight-color)) !important;
		}
		.tree-search ::placeholder,
		.project-search-results {
			color: var(--main-theme-text-invert-color);
		}
		.tree-search > div {
			padding: 5px 0px;
			box-sizing: content-box;
		}
		</style>
	`;
	const searchBody = `
		<div class="tree-search" style="visibility:hidden; height: 0;">
			<div class='project-search-input'>
				<input type="text" placeholder="Search"/>
			</div>
			<div class='project-search-include'>
				<label>files to include</label>
				<input type="text" value="./"/>
			</div>
			<div class='project-search-exclude'>
				<label>files to exclude</label>
				<input type="text" />
			</div>
			<div class='project-search-results'>
				<span class="project-search-results-summary">X</span>
				<span> results in </span>
				<span class="project-search-results-list">Y</span>
				<span>files.</span>
			</div>
		</div>
	`;
	search.innerHTML = searchStyle + searchBody;
	return search;
};

const getTreeViewDOM = ({ showOpenService  } = {}) => {
	if(opener && showOpenService){
		opener.classList.remove('hidden');
		const treeMenuLabel = document.querySelector('#tree-menu .title-label h2');
		treeMenuLabel.innerText = 'NO FOLDER OPENED';
	} else if(opener) {
		opener.classList.add('hidden');
	}
	if(treeView){
		return treeView;
	}

	treeView = document.createElement('div');
	treeView.id = 'tree-view';
	opener = ProjectOpener();
	if(showOpenService){
		const treeMenuLabel = document.querySelector('#tree-menu .title-label h2');
		treeMenuLabel.innerText = 'NO FOLDER OPENED';
	} else {
		opener.classList.add('hidden');
	}
	treeView.appendChild(opener);

	const explorerPane = document.body.querySelector('#explorer');
	explorerPane.appendChild(TreeMenu());
	explorerPane.appendChild(Search());
	explorerPane.appendChild(treeView);
	explorerPane.classList.remove('pane-loading');

	return treeView;
};

const updateTree = (treeView) => (change, { name, id, file }) => {
	if(change !== "dirty"){
		return;
	}

	let dirtyParents;
	//console.log(`Need to mark ${file} from ${name} ${id} as dirty`);
	Array.from(treeView.querySelectorAll('.tree-leaf-content'))
		.forEach(t => {
			const item = JSON.parse(t.dataset.item);
			if(item.name === file){
				t.classList.add('changed');
				dirtyParents = t.dataset.path.split('/').filter(x => !!x);
			}
		});
	if(!dirtyParents){
		return
	}
	Array.from(treeView.querySelectorAll('.tree-leaf-content'))
		.forEach(t => {
			const item = JSON.parse(t.dataset.item);
			if(dirtyParents.includes(item.name)){
				t.classList.add('changed');
			}
		});
}

function treeDomNodeFromPath(path){
	if(!path){
		return document.querySelector('#tree-view');
	}
	const leaves = Array.from(document.querySelectorAll('#tree-view .tree-leaf-content'));
	const name = path.split('/').pop()
	const found = leaves.find(x => JSON.parse(x.dataset.item).name === name)
	return found;
}

function newFile({ parent, onDone }){
	if(!onDone){
		return console.error('newFile requires an onDone event handler');
	}
	const parentDOM = treeDomNodeFromPath(parent);
	let nearbySibling;
	if(parent){
		const expando = parentDOM.querySelector('.tree-expando');
		expando.classList.remove('closed');
		expando.classList.add('expanded', 'open');
		const childLeaves = parentDOM.parentNode.querySelector('.tree-child-leaves');
		childLeaves.classList.remove('hidden');
		nearbySibling = childLeaves.querySelector('.tree-leaf');
	} else {
		try {
			nearbySibling = Array.from(parentDOM.children)
				.find(x => JSON.parse(
					x.querySelector('.tree-leaf-content').dataset.item
					).children.length === 0
				)
		} catch(e) {}
	}
	if(!nearbySibling){
		console.error('unable to add new file; error parsing DOM')
		return;
	}
	const paddingLeft = nearbySibling
		.querySelector('.tree-leaf-content')
		.style.paddingLeft;
	const newFileNode = htmlToElement(`
		<div class="tree-leaf new">
			<div class="tree-leaf-content" style="padding-left: ${paddingLeft};">
				<div class="tree-leaf-text icon-default">
					<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
				</div>
			</div>
		</div>
		`);
	const fileNameInput = newFileNode.querySelector('input');
	const finishInput = (event) => {
		if (event.key && event.key !== "Enter") { return; }
		const filename = fileNameInput.value;

		fileNameInput.removeEventListener('blur', finishInput);
		fileNameInput.removeEventListener('keyup', finishInput);
		if(!filename){ return; }

		newFileNode.classList.add('creating');
		fileNameInput.disabled = true;
		onDone(filename, parent);
	};
	fileNameInput.addEventListener("blur", finishInput);
	fileNameInput.addEventListener("keyup", finishInput);

	//TODO: focus input, when input loses focus create real file
	//TODO: when ENTER is pressed, create real file (or add a cool error box)
	nearbySibling.parentNode.insertBefore(newFileNode, nearbySibling);
	fileNameInput.focus();
}
window.newFile = newFile; //TODO: kill this some day

function newFolder({ parent, onDone }){
	if(!onDone){
		return console.error('newFolder requires an onDone event handler');
	}
	const parentDOM = treeDomNodeFromPath(parent);
	const expando = parentDOM.querySelector('.tree-expando');
	expando.classList.remove('closed');
	expando.classList.add('expanded', 'open');
	const childLeaves = parentDOM.parentNode.querySelector('.tree-child-leaves');
	childLeaves.classList.remove('hidden');
	const nearbySibling = childLeaves.querySelector('.tree-leaf');
	const paddingLeft = nearbySibling
		.querySelector('.tree-leaf-content')
		.style.paddingLeft;
	const newFolderNode = htmlToElement(`
		<div class="tree-leaf new">
			<div class="tree-leaf-content" style="padding-left: ${paddingLeft};">
				<div class="tree-leaf-text icon-default">
					<input type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
				</div>
			</div>
		</div>
	`);
	const folderNameInput = newFolderNode.querySelector('input');
	const finishInput = (event) => {
		if (event.key && event.key !== "Enter") { return; }
		const foldername = folderNameInput.value;

		folderNameInput.removeEventListener('blur', finishInput);
		folderNameInput.removeEventListener('keyup', finishInput);
		newFolderNode.parentNode.removeChild(newFolderNode);

		if(!foldername){ return; }
		onDone(foldername, parent);
	};
	folderNameInput.addEventListener("blur", finishInput);
	folderNameInput.addEventListener("keyup", finishInput);

	//TODO: focus input, when input loses focus create real folder
	//TODO: when ENTER is pressed, create real folder (or add a cool error box)
	nearbySibling.parentNode.insertBefore(newFolderNode, nearbySibling);
	folderNameInput.focus();
}

function showServiceChooser(treeview){
	return () => {
		getTreeViewDOM({ showOpenService: true  })
	};
}

let projectName;
const updateTreeMenu = ({ title, project }) => {
	const treeMenu = document.querySelector('#explorer #tree-menu');
	const titleEl = treeMenu.querySelector('.title-label h2');
	if(title){
		titleEl.setAttribute('title', title);
		titleEl.innerText = title;
		return;
	}
	titleEl.setAttribute('title', project || projectName || '');
	titleEl.innerText = project || projectName || '';
	if(project){
		projectName = project;
	}
};

const showSearch = (treeView) => {
	const treeSearch = treeView.parentNode.querySelector('.tree-search');
	const searchInput = document.querySelector('.project-search-input input');
	return ({ show }) => {
		if(show){
			treeView.style.visibility = 'hidden';
			treeView.style.height = 0;
			treeSearch.style.visibility = 'visible';
			treeSearch.style.height = '';
			updateTreeMenu({ title: 'search' });
			setTimeout(() => {
				searchInput.focus();
				searchInput.select();
			}, 1);
		} else {
			treeView.style.visibility = 'visible';
			treeView.style.height = '';
			treeSearch.style.visibility = 'hidden';
			treeSearch.style.height = 0;
			updateTreeMenu({ })
		}
	};
};

function _TreeView(op){
	if(op === "hide"){
		const prevTreeView = document.querySelector('#tree-view');
		if(prevTreeView){
			prevTreeView.style.display = "none";
		}
		return;
	}
	const treeView = getTreeViewDOM();
	treeView.style.display = "";

	attachListener(
		treeView,
		JSTreeView,
		updateTree(treeView),
		{
			newFile, newFolder,
			showSearch: showSearch(treeView),
			updateTreeMenu,
			showServiceChooser: showServiceChooser(treeView)
		}
	);
}

export default _TreeView;
