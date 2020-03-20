import TreeView from "../../shared/vendor/js-treeview.1.1.5.js";
//import TreeView from "https://dev.jspm.io/js-treeview@1.1.5";

const getTreeViewDOM = () => {
	const prevTreeView = document.querySelector('#tree-view');
	if(prevTreeView){
		return prevTreeView;
	}
	const _tree = document.createElement('div');
	_tree.id = 'tree-view';
	_tree.classList.add(
		'sidenav', 'sidenav-fixed'
	);
	document.body.appendChild(_tree);
	return _tree;
}

const exampleTree = {
	"Server Client Bundle": {
		server: {
			routes: {
				"users.js": {},
				"company.js": {},
				"vehicles.js": {},
			},
			"index.js": {}
		},
		client: {
			components: {
				"index.js": {},
				"menu.js": {},
				"list.js": {},
			},
			images: {
				"logo.gif": {},
				"icon-person.png": {},
				"splash.gif": {},
			},
			"index.js": {}
		},
		"ReadMe.md": {},
		"bartok.yml": {},
		"package.json": {},
	}
}

const fileTreeConvert = (input, converted=[]) => {
	const keys = Object.keys(input);
	keys.forEach(k => {
		converted.push({
			name: k,
			children: fileTreeConvert(input[k])
		})
	});
	return converted;
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

	const converted = fileTreeConvert(exampleTree);
	converted[0].expanded = true;
	var tree = new TreeView(converted, 'tree-view');

	Array.from(treeView.querySelectorAll('.tree-leaf-content')).forEach(t => {
		const item = JSON.parse(t.dataset.item);
		if(item.children.length){
			t.classList.add('folder');
		}
	});


}

export default _TreeView;