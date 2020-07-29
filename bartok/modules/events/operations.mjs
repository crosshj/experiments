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

const guessCurrentFolder = (currentFile, currentService) => {
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
	getCurrentFile, getCurrentService, getCurrentFolder,
}) => (event) => {
	// this should move to management.mjs
	const { detail } = event;
	const { callback } = detail;
	const currentFile = getCurrentFile();
	const currentService = getCurrentService();
	const currentFolder = getCurrentFolder();
	const parent = currentFolder
		? currentFolder
		: guessCurrentFolder(currentFile, currentService);

	callback && callback(
		!parent ? 'trouble finding current path' : false,
		parent
	);
};

const changeCurrentFolderHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService, getCurrentFolder, setCurrentFolder,
}) => (event) => {
	console.log('OPERATIONS: changeCurrentFolder');
	const { detail } = event;
	const { callback, folderPath } = detail;

	const currentFile = getCurrentFile();
	const currentService = getCurrentService();
	//const currentFolder = getCurrentFolder();
	const parent = guessCurrentFolder(folderPath, currentService);

	const firsChar = folderPath[0];
	const currentPath = (
		firsChar === "/"
			? folderPath
			: (parent||"") + '/' + folderPath
	).replace(/\/\//g, '/')

	if(parent !== '/'){
		console.error(`Should be looking for folder in current parent! : ${parent}`);
	}
	//TODO: look for folder in current folder
	//debugger;
	setCurrentFolder(currentPath);

	const fileSelectEvent = new CustomEvent('folderSelect', {
		bubbles: true,
		detail: { name: currentPath }
	});
	document.body.dispatchEvent(fileSelectEvent);

	//console.log({ detail });
	callback && callback(null, ' ');
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

const deleteFolderHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService, operations
}) => async (event) => {
	const { detail } = event;
	const { callback } = detail;
	const currentService = getCurrentService();
	const currentFile = getCurrentFile();
	event.detail.operation = event.detail.operation || event.type;
	const manageOp = managementOp(event, currentService, currentFile);

	await performOp(
		currentService, operations, performOperation, externalStateRequest, callback
	);
};

const moveFolderHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService, operations
}) => async (event) => {
	//console.log('OPERATIONS: move');
	const { detail } = event;
	const { callback } = detail;
	const currentService = getCurrentService();
	const currentFile = getCurrentFile();
	event.detail.operation = event.detail.operation || event.type;
	const manageOp = managementOp(event, currentService, currentFile);

	await performOp(
		currentService, operations, performOperation, externalStateRequest, callback
	);
};

const moveFileHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService, operations
}) => async (event) => {
	//console.log('OPERATIONS: move');
	const { detail } = event;
	const { callback } = detail;
	const currentService = getCurrentService();
	const currentFile = getCurrentFile();
	event.detail.operation = event.detail.operation || event.type;
	const manageOp = managementOp(event, currentService, currentFile);

	await performOp(
		currentService, operations, performOperation, externalStateRequest, callback
	);
};

const readFolderHandler = ({
	managementOp, performOperation, externalStateRequest,
	getCurrentFile, getCurrentService, getCurrentFolder,
}) => (event) => {
	// this should move to management.mjs
	const { detail } = event;
	const { callback } = detail;
	const currentFile = getCurrentFile();
	const currentService = getCurrentService();
	const currentFolder = getCurrentFolder();
	const parent = currentFolder
		? currentFolder
		: guessCurrentFolder(currentFile, currentService);

	event.detail.operation = 'readFolder';
	const children = managementOp(event, currentService, currentFile, parent);

	console.log({ children });
	callback && callback(
		!parent || !children ? 'trouble finding current path or children' : false,
		children && children.length  ? children.join('\n') : '<empty>'
	);
};

const operationsHandler = ({
	managementOp, externalStateRequest,
	getCurrentFile, getCurrentService,
	getCurrentFolder, setCurrentFolder,
	resetState,
	getOperations, getReadAfter, getUpdateAfter,
	performOperation, operationsListener
}) => (event) => {
	try {
		const dummyFunc = () => {
			debugger;
			return {};
		};
		const updateAfter = getUpdateAfter(dummyFunc, dummyFunc, dummyFunc);
		const readAfter = getReadAfter(dummyFunc);

		const allOperations = getOperations(updateAfter, readAfter);
		console.log({ allOperations, event })
		const foundOp = allOperations.find(x => x.name === event.detail.operation);
		const eventData = event.detail.body;
		performOperation(foundOp, eventData, externalStateRequest);
		//wrangle context(state?)?
		//execute operation with context
		//debugger;
	} catch(e){
		console.error(e);
	}
};

const handlers = {
	showCurrentFolderHandler,
	changeCurrentFolderHandler,
	addFolderHandler,
	readFolderHandler,
	deleteFolderHandler,
	renameFolderHandler,
	moveFolderHandler,
	moveFileHandler,
	operationsHandler
};

function attachListeners(...args){
	const mapListeners = (handlerName) => {
		const eventName = handlerName.replace('Handler', '');
		attach({
			name: 'Operations',
			eventName,
			listener: handlers[handlerName](...args)
		});
	};
	Object.keys(handlers).map(mapListeners);
}

export {
	attachListeners
};
