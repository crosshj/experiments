import JSTreeView from "../../shared/vendor/js-treeview.1.1.5.js";
//import JSTreeView from "https://dev.jspm.io/js-treeview@1.1.5";

import { attachListener } from './events/tree.mjs';

function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim(); // Never return a text node of whitespace as the result
	template.innerHTML = html;
	return template.content.firstChild;
}

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
		_tree.appendChild(opener);
	}
	const search = document.createElement('div');
	search.innerHTML = `
		<style>
		.tree-search {
			display: flex;
			flex-direction: column;
			padding: 0px 20px;
			margin-right: 17px;
		}
		.tree-search p {
			white-space: normal;
		}
		</style>
		<div class="tree-search" style="visibility:hidden; height: 0;">
			<p>THIS IS WHERE PROJECT SEARCH GOES!</p>
		</div>
	`;

	// _tree.classList.add(
	// 	'sidenav', 'sidenav-fixed'
	// );
	const _treeMenu = document.createElement('div');
	_treeMenu.id="tree-menu";
	_treeMenu.classList.add("row", "no-margin");

	explorerPane.appendChild(_treeMenu);
	explorerPane.appendChild(search);
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

const showSearch = (treeView) => ({ show }) => {
	if(show){
		treeView.style.visibility = 'hidden';
		treeView.style.height = 0;
		treeView.parentNode.querySelector('.tree-search').style.visibility = 'visible';
		treeView.parentNode.querySelector('.tree-search').style.height = '';
	} else {
		treeView.style.visibility = 'visible';
		treeView.style.height = '';
		treeView.parentNode.querySelector('.tree-search').style.visibility = 'hidden';
		treeView.parentNode.querySelector('.tree-search').style.height = 0;
	}
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
			showSearch: showSearch(treeView)
		}
	);
}

export default _TreeView;
