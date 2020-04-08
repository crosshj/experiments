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
		let done;
		let path = [];
		let file = currentFile;
		while(!done){
			file = flat.find(x => x.name === file).parent;
			if(file === '/'){
				done = true
			} else {
				path.push(file);
			}
		}
		parent = '/' + path.reverse().join('/')
	} catch(e){}
	return parent;
};

async function performOp(
	currentService, operations, performOperation, externalStateRequest, callback
) {
	const files = JSON.parse(JSON.stringify(currentService.code));
	const body = {
		id: currentService.id,
		name: currentService.name,
		code: JSON.stringify({
			tree: currentService.tree,
			files
		}),
	};

	const foundOp = operations.find(x => x.name === 'update');
	const foundOpClone = JSON.parse(JSON.stringify(foundOp));
	foundOpClone.config = foundOpClone.config || {};
	foundOpClone.config.body = JSON.stringify(body);

	foundOpClone.after = (...args) => {
		foundOp.after(...args);
		callback && callback(null, 'DONE');
	};

	await performOperation(foundOpClone, { body }, externalStateRequest);
}

// -----------------------------------------------------------------------------

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
	getCurrentFile, getCurrentService, operations
}) => async (event) => {
	const { detail } = event;
	const { callback } = detail;
	const currentService = getCurrentService();
	const currentFile = getCurrentFile();
	event.detail.operation = event.detail.operation || event.type;
	const manageOp = managementOp(event, currentService, currentFile);
	//currentService, operations, performOperation, externalStateRequest
	await performOp(
		currentService, operations, performOperation, externalStateRequest, callback
	);
};


////// ------------------------------------------------------------------------

const renameFolderHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService, operations
}) => async (event) => {
	// console.log('OPERATIONS: renameFolder');
	const { detail } = event;
	const { callback } = detail;
	const currentService = getCurrentService();
	const currentFile = getCurrentFile();
	event.detail.operation = event.detail.operation || event.type;
	const manageOp = managementOp(event, currentService, currentFile);
	//currentService, operations, performOperation, externalStateRequest
	await performOp(
		currentService, operations, performOperation, externalStateRequest, callback
	);
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
	getCurrentFile, getCurrentService,
	operations
}){
	const mapListeners = (handlerName) => {
		const eventName = handlerName.replace('Handler', '');
		attach({
			name: 'Operations',
			eventName,
			listener: handlers[handlerName]({
				managementOp, performOperation, externalStateRequest,
				getCurrentFile, getCurrentService,
				operations
			})
		});
	};
	Object.keys(handlers).map(mapListeners);
}

export {
	attachListeners
};
