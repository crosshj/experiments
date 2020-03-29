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
	}
	catch (e) {
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

const ops = {
	addFile, renameFile, deleteFile, moveFile,
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


