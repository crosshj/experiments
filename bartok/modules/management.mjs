function addFile(e, currentService, currentFile) {
	const { filename } = e.detail;
	let manageOp, currentServiceCode, treeEntryAdded;

	try {
		//TODO: guard against empty/improper filename
		currentServiceCode = JSON.parse(JSON.stringify(currentService.code));
		currentServiceCode.push({
			name: filename,
			code: ""
		});
		//TODO: only handles root level files!!!
		currentService.tree[Object.keys(currentService.tree)[0]][filename] = {};
		treeEntryAdded = true;
		manageOp = {
			operation: "updateProject"
		};
	}
	catch (e) {
		console.log('could not add file');
		console.log(e);
	}
	if(manageOp && currentServiceCode && treeEntryAdded){
		currentService.code = currentServiceCode;
	}
	return manageOp;
}

function renameFile(e, currentService, currentFile){
	const { filename, newName } = e.detail;
	let manageOp, currentServiceCode, treeEntryRenamed;

	try {
		//TODO: guard against empty/improper filename, newName
		currentServiceCode = JSON.parse(JSON.stringify(currentService.code));
		const fileToRename = currentServiceCode.find(x => x.name === filename);
		fileToRename.name = newName;

		//TODO: only handles root level files!!!
		const rootLevel = currentService.tree[Object.keys(currentService.tree)[0]];
		delete rootLevel[filename];
		rootLevel[newName] = {};
		treeEntryRenamed = true;
		manageOp = {
			operation: "updateProject"
		};
	}
	catch (e) {
		console.log('could not rename file');
		console.log(e);
	}
	if(manageOp && currentServiceCode && treeEntryRenamed){
		currentService.code = currentServiceCode;
	}
	// console.log(JSON.stringify({ currentService }, null, 2 ));
	// return;
	return manageOp;
}

function deleteFile(e, currentService, currentFile){
	console.log('deleteFile');
	const { filename=currentFile } = e.detail;
	let manageOp, currentServiceCode, treeEntryDeleted;
	try {
		//TODO: guard against empty/improper filename
		currentServiceCode = currentService.code.filter(x => x.name !== filename);
		//TODO: only handles root level files!!!
		delete currentService.tree[Object.keys(currentService.tree)[0]][filename]
		treeEntryDeleted = true;
		manageOp = {
			operation: "updateProject"
		};
	} catch (e) {
		console.log('could not delete file');
		console.log(e);
	}
	if(manageOp && currentServiceCode && treeEntryDeleted){
		currentService.code = currentServiceCode;
	}
	return manageOp;
}

function moveFile(e, currentService, currentFile){
	console.log('moveFile');
	return;
}

function renameProject(e, currentService, currentFile){
	console.log('renameProject');
	return;
}

function getContextFromPath(root, folderPath){
	const split = folderPath.split('/').filter(x => !!x);
	const folderName = split.pop();
	const parentObject = split
		.reduce((all, one) => {
			all[one] = all[one] || {};
			return all[one];
		}, root);
	return { folderName, parentObject};
}

function addFolder(e, currentService, currentFile){
	console.log('addFolder');
	let { folderName, parent } = e.detail;
	let manageOp, currentServiceCode, folderAdded;
	try {
		//TODO: guard against empty/improper filename
		const rootFolderName = Object.keys(currentService.tree)[0];
		let parentObject = currentService.tree[rootFolderName];

		if(folderName.includes('/')){
			({ folderName, parentObject} = getContextFromPath(
				parentObject, folderPath
			));
		}
		parentObject[folderName] = {};
		folderAdded = true;
		manageOp = {
			operation: "updateProject"
		};
	} catch (e) {
		console.log('could not add folder');
		console.log(e);
	}
	if(manageOp && currentServiceCode && treeEntryDeleted){
		currentService.code = currentServiceCode;
	}
	return manageOp;
}

function renameFolder(e, currentService, currentFile){
	console.log('renameFolder');
	let { oldName, newName } = e.detail;
	let manageOp, currentServiceCode, folderRenamed;
	try {
		//TODO: guard against empty/improper filename
		const rootFolderName = Object.keys(currentService.tree)[0];
		let root = currentService.tree[rootFolderName];

		let { folderName, parentObject} = getContextFromPath(root, oldName);
		const oldFolderParent = parentObject;
		const oldFolderName = folderName;

		// this clone causes problems with JSX and HTML files
		const clonedOldFolderContents = JSON.parse(JSON.stringify(
			oldFolderParent[oldFolderName]
		));

		({ folderName, parentObject} = getContextFromPath(root, newName));
		const newFolderParent = parentObject;
		const newFolderName = folderName;

		newFolderParent[newFolderName] = clonedOldFolderContents;
		delete oldFolderParent[oldFolderName];
	} catch (e) {
		console.log('could not rename folder');
		console.log(e);
	}
	if(manageOp && currentServiceCode && treeEntryDeleted){
		currentService.code = currentServiceCode;
	}
	return manageOp;
}

const ops = {
	addFile, renameFile, deleteFile, moveFile,
	addFolder, renameFolder,
	renameProject
};
function managementOp(e, currentService, currentFile) {
	const thisOps = Object.keys(ops);
	const { operation="" } = (e && e.detail) || {};
	if (!thisOps.includes(operation)) {
		return;
	}
	const manageOp = ops[operation]
		? ops[operation](e, currentService, currentFile)
		: undefined;
	return manageOp;
}

export {
	managementOp
};


