import JSTreeView from "../../shared/vendor/js-treeview.1.1.5.js";
//import JSTreeView from "https://dev.jspm.io/js-treeview@1.1.5";

import { attachListener } from './events/tree.mjs';

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim(); // Never return a text node of whitespace as the result
	template.innerHTML = html;
	return template.content.firstChild;
}

const ProjectOpener = () => {
	const opener = document.createElement('div');
	opener.innerHTML = `
		<style>
		.service-opener {
			display: flex;
			flex-direction: column;
			padding: 0px 20px;
			margin-right: 17px;
		}
		.service-opener button {
			color: white;
			background: #0e639c;
			border: 0;
			padding: 10px;
		}
		.service-opener p {
			white-space: normal;
		}
		</style>
		<div class="service-opener">
			<p>No service selected.</p>
			<button>Open Service</button>
			<p>Note: this button doesn't work, lol! Some day it will!</p>
			<button>Create New Service</button>
			<p>Note: this button ALSO doesn't work, lol! Some day it will!</p>
		</div>
	`;
	return opener;
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

const getTreeViewDOM = ({ contextHandler } = {}) => {
	const explorerPane = document.body.querySelector('#explorer');
	const prevTreeView = document.querySelector('#tree-view');
	if(prevTreeView){
		explorerPane.classList.remove('pane-loading');
		return prevTreeView;
	}

	//explorerPane.classList.add('pane-loading');
	const _tree = document.createElement('div');
	_tree.id = 'tree-view';

	// TODO: this should be shown when we know that no service is selected
	const showOpenService = false;
	if(showOpenService){
		_tree.appendChild(ProjectOpener());
	}6

	explorerPane.appendChild(TreeMenu());
	explorerPane.appendChild(Search());
	explorerPane.appendChild(_tree);

	return _tree;
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
function newFile({ onDone }){
	if(!onDone){
		return console.error('newFile requires an onDone event handler');
	}
	const nearbySibling = document.body
		.querySelector('#tree-view > .tree-leaf > .tree-leaf-content:not(.folder)')
		.parentNode;
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
		newFileNode.parentNode.removeChild(newFileNode);

		if(!filename){ return; }
		onDone(filename);
	};
	fileNameInput.addEventListener("blur", finishInput);
	fileNameInput.addEventListener("keyup", finishInput);

	//TODO: focus input, when input loses focus create real file
	//TODO: when ENTER is pressed, create real file (or add a cool error box)
	nearbySibling.parentNode.insertBefore(newFileNode, nearbySibling);
	fileNameInput.focus();
}

window.newFile = newFile; //TODO: kill this some day

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
			newFile,
			showSearch: showSearch(treeView),
			updateTreeMenu
		}
	);
}

export default _TreeView;
