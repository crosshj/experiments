import TreeView from "../../shared/vendor/js-treeview.1.1.5.js";
//import TreeView from "https://dev.jspm.io/js-treeview@1.1.5";

const getTreeViewDOM = ({ contextHandler } = {}) => {
	const prevTreeView = document.querySelector('#tree-view');
	if(prevTreeView){
		return prevTreeView;
	}
	const _tree = document.createElement('div');
	_tree.id = 'tree-view';
	// _tree.classList.add(
	// 	'sidenav', 'sidenav-fixed'
	// );
	_tree.addEventListener( "contextmenu", contextHandler);
	const _treeMenu = document.createElement('div');
	_treeMenu.id="tree-menu";
	_treeMenu.classList.add("row", "no-margin");
	document.body.querySelector('#explorer').appendChild(_treeMenu);
	document.body.querySelector('#explorer').appendChild(_tree);
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

const contextMenuInit = (callback) => {
	//https://materializecss.com/dropdown.html
	const dropdown = document.createElement('ul');
	dropdown.id = "dropdown1";
	dropdown.classList.add('dropdown-content');
	dropdown.innerHTML = `
		<li><a href="#!">create</a></li>
		<li><a href="#!">cancel</a></li>
		<li><a href="#!">delete</a></li>
		<li><a href="#!">persist</a></li>
		<li><a href="#!">update</a></li>
	`;
	//<li><a href="#!"><i class="material-icons">cloud</i>five</a></li>

	dropdown.addEventListener('click', e => {
		const operation = e.target.innerText;
		const event = new CustomEvent('operations', {
			bubbles: true,
			detail: {
				operation,
				body: {
					//name: (containerDiv.querySelector('#service_name')||{}).value,
					//id: (containerDiv.querySelector('#service_id')||{}).value,
					code: (window.Editor||{ getValue: ()=>{}}).getValue()
				}
			}
		});
		document.body.dispatchEvent(event);
		e.preventDefault();
		return false;
	});

	document.body.appendChild(dropdown);
	callback();
};

const contextMenu = (e) => {
	console.log(e.target);
	e.target.dataset.target = 'dropdown1';

	contextMenuInit(() => {
		const options = {
			/*
			alignment	String	'left'	Defines the edge the menu is aligned to.
			autoTrigger	Boolean	true	If true, automatically focus dropdown el for keyboard.
			constrainWidth	Boolean	true	If true, constrainWidth to the size of the dropdown activator.
			container	Element	null	Provide an element that will be the bounding container of the dropdown.
			coverTrigger	Boolean	true	If false, the dropdown will show below the trigger.
			closeOnClick	Boolean	true	If true, close dropdown on item click.
			hover	Boolean	false	If true, the dropdown will open on hover.
			inDuration	Number	150	The duration of the transition enter in milliseconds.
			outDuration	Number	250	The duration of the transition out in milliseconds.
			onOpenStart	Function	null	Function called when dropdown starts entering.
			onOpenEnd	Function	null	Function called when dropdown finishes entering.
			onCloseStart	Function	null	Function called when dropdown starts exiting.
			onCloseEnd	Function	null	Function called when dropdown finishes exiting.
			*/
		};

		//TODO: maybe should destroy the instance after click out

		var instance = M.Dropdown.init(e.target, options);
		instance.open();
	});

	e.preventDefault();
	return false;
};

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
	const treeView = getTreeViewDOM({
		contextHandler: contextMenu
	});
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