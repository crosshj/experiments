import { isString } from './Types.mjs';

let currentService;
let currentFile;
let currentFolder;

function getDefaultFile(service){
	let defaultFile;
	try {
		const packageJson = JSON.parse(
			service.code.find(x => x.name === "package.json").code
		);
		defaultFile = packageJson.main;
	} catch(e){}
	return defaultFile || "index.js";
}

// has side effects of setting current code
const getCurrentService = () => {
	const changedArray = Object.keys(state.changedFiles)
		.map(k => state.changedFiles[k]);
	const mostRecent = changedArray.map(x => x[x.length-1]);

	//error here because currentService is wrong sometimes

	// SIDE EFFECTS!!!
	mostRecent.forEach(m => {
		const found = currentService.code.find(x => x.name === m.filename);
		if(!found){
			console.error({
				changedArray, mostRecent, filename: m.filename, found: found || 'notfound'
			});
			debugger;
			return;
		}
		found.code = m.code;
	});

	return currentService;
}

// has side-effects of setting currentService and currentFile

// this should really be broken out into:
//    setCurrentFile, setCurrentService
//    getCurrentFile, getCurrentService

function getCodeFromService(service, file){
	const serviceAction = !!service ? "set" : "get";
	const fileAction = !!file ? "set" : "get";

	if(
		serviceAction === "set" && currentService &&
		Number(currentService.id) !== Number(service.id)
	){
		resetState();
	}

	if(serviceAction === "set"){
		currentService = service;
	}

	if(serviceAction === "get"){
		//this caues service files based on changedArray
		getCurrentService();
	}

	if(fileAction === "set"){
		currentFile = file;
	}

	if(fileAction === "get"){
		currentFile = currentFile || getDefaultFile(currentService);
	}

	const code = Array.isArray(currentService.code)
		? (currentService.code.find(x => x.name === currentFile)||{}).code || ""
		: isString(() => currentService.code)
			? currentService.code
			: "";

	return {
		name: currentService.name,
		id: currentService.id,
		// may be able to make next two lines go away (and also other code and file related stuff
		code,
		filename: currentFile
	};
}

const state = {
	changedFiles: {}
};

function getState(){
	//TODO: should probably pull only latest state change
	return JSON.parse(JSON.stringify(state));
}

function setState(change){
	//TODO: this could be expensive
	const { name, id, code, prevCode, filename } = change;
	//console.log(change);
	const stateKey = `${id}|${name}|${filename}`;

	if(!state.changedFiles[stateKey]){
		state.changedFiles[stateKey] = [{
			name, id, code: prevCode
		}];
	}
	state.changedFiles[stateKey]
		.push({ name, id, code, filename });
	return currentFile;
}

const getCurrentFile = () => currentFile;
const getCurrentFolder = () => currentFolder;
const setCurrentFolder = (path) => {
	currentFolder = path;
};

const resetState = () => {
	//console.log(`Current Service reset!`);
	currentFile = currentService = null;
	state.changedFiles = {};
};

export {
	getCodeFromService, getCurrentFile, getCurrentService,
	getCurrentFolder, setCurrentFolder,
	getState, setState, resetState
};
