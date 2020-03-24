import { attach } from '../Listeners.mjs';

// const exampleTree = {
// 	"Server Client Bundle": {
// 		server: {
// 			routes: {
// 				"users.js": {},
// 				"company.js": {},
// 				"vehicles.js": {},
// 			},
// 			"index.js": {}
// 		},
// 		client: {
// 			components: {
// 				"index.js": {},
// 				"menu.js": {},
// 				"list.js": {},
// 			},
// 			images: {
// 				"logo.gif": {},
// 				"icon-person.png": {},
// 				"splash.gif": {},
// 			},
// 			"index.js": {}
// 		},
// 		"ReadMe.md": {},
// 		"bartok.yml": {},
// 		"package.json": {},
// 	}
// };

// const converted = fileTreeConvert(exampleTree);
// converted[0].expanded = true;
// var tree = new TreeView(converted, 'tree-view');

// Array.from(treeView.querySelectorAll('.tree-leaf-content')).forEach(t => {
// 	const item = JSON.parse(t.dataset.item);
// 	if(item.children.length){
// 		t.classList.add('folder');
// 	}
// });


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
	return converted;
};

let tree;
//TODO: code that creates a tree should live in ../TreeView and be passed here!!
function attachListener(treeView, JSTreeView){
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
		const newTree = new JSTreeView(converted, 'tree-view');
		newTree.id = id;

		newTree.on('select', function (e) {
			try{
				const currentParent = e.target.target.parentNode;
				if(currentParent.classList.contains('selected')){
					return;
				}
				Array.from(document.querySelectorAll('#tree-view .selected')||[])
					.forEach(x => x.classList.remove('selected'));
				currentParent.classList.add('selected');
			} catch(e) {
				console.error(e);
				console.error('could not mark leaf as selected');
			}
			if(e.data.children.length > 1){
				return;
			}
			const event = new CustomEvent('treeSelect', {
				bubbles: true,
				detail: { name: e.data.name }
			});
			document.body.dispatchEvent(event);
		});

		Array.from(treeView.querySelectorAll('.tree-leaf-content')).forEach(t => {
			const item = JSON.parse(t.dataset.item);
			if(item.children.length){
				t.classList.add('folder');
			}
			if(item.name === "index.js"){
				t.classList.add('selected');
			}
		});
		setTimeout(() => {
			//currentExplorer.style.width = backupStyle.clientWidth;
			//currentExplorer.style.minWidth = backupStyle.minWidth;
		}, 1000)
	};
	attach({
		name: 'TreeView',
		eventName: 'operationDone',
		listener
	});
}


export {
	attachListener
};
