import { attach } from '../Listeners.mjs';

const flattenTree = (tree) => {
	const results = [];
	const recurse = (branch, parent='/') => {
		const leaves = Object.keys(branch);
		leaves.map(x => {
			results.push({
				name: x, parent
			})
			recurse(branch[x], x);
		});
	};
	recurse(tree);
	return results;
};

const currentFolder = (currentFile, currentService) => {
	let parent;
	try {
		const flat = flattenTree(currentService.tree[Object.keys(currentService.tree)[0]]);
		// TODO: should follow parents up tree and build path from that
		parent = flat.find(x => x.name === currentFile).parent;
	} catch(e){}
	return parent;
};

const showCurrentFolderHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService
}) => (event) => {
	// this should move to management.mjs
	const { detail } = event;
	const { callback } = detail;
	const currentFile = getCurrentFile();
	const currentService = getCurrentService();
	const parent = currentFolder(currentFile, currentService);

	callback && callback(
		!parent ? 'trouble finding current path' : false,
		parent
	);
};

const changeCurrentFolderHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService
}) => (event) => {
	// console.log('OPERATIONS: changeCurrentFolder');
	const { detail } = event;
	const { callback } = detail;
	console.log({ detail });
	callback && callback(null, 'TODO: change current folder');
};

const addFolderHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService
}) => (event) => {
	// console.log('OPERATIONS: addFolder');
	const { detail } = event;
	const { callback } = detail;
	console.log({ detail });
	callback && callback(null, 'TODO: add folder');
};
const readFolderHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService
}) => (event) => {
	// console.log('OPERATIONS: readFolder');
	const { detail } = event;
	const { callback } = detail;
	console.log({ detail });
	callback && callback(null, 'TODO: read contents of folder');
};
const deleteFolderHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService
}) => (event) => {
	// console.log('OPERATIONS: deleteFolder');
	const { detail } = event;
	const { callback } = detail;
	console.log({ detail });
	callback && callback(null, 'TODO: delete folder');
};
const renameFolderHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService
}) => (event) => {
	// console.log('OPERATIONS: renameFolder');
	const { detail } = event;
	const { callback } = detail;
	console.log({ detail });
	callback && callback(null, 'TODO: rename folder');
};
const moveHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService
}) => (event) => {
	// console.log('OPERATIONS: move');
	const { detail } = event;
	const { callback } = detail;
	console.log({ detail });
	callback && callback(null, 'TODO: move file or folder');
};

const handlers = {
	showCurrentFolderHandler,
	changeCurrentFolderHandler,
	addFolderHandler,
	readFolderHandler,
	deleteFolderHandler,
	renameFolderHandler,
	moveHandler
};

function attachListeners({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService
}){
	const mapListeners = (handlerName) => {
		const eventName = handlerName.replace('Handler', '');
		attach({
			name: 'Operations',
			eventName,
			listener: handlers[handlerName]({
				managementOp, performOperation, externalStateRequest,
				getCurrentFile, getCurrentService
			})
		});
	};
	Object.keys(handlers).map(mapListeners);
}

export {
	attachListeners
};
