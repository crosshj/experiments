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
function getCodeFromService(service, file){

	if(service){
		currentService = service;
		currentFile = undefined;
		//TODO: and update changedArray?
		console.log(`Current Service: ${service.id}: ${service.name}`);
	}
	//debugger;
	getCurrentService(); //this caues service status to update?

	if(!service){
		service = currentService || {};
	}

	if(!file){
		currentFile = currentFile || getDefaultFile(service);
		file = currentFile;
	} else {
		currentFile = file;
	}
	const code = Array.isArray(service.code)
		? (service.code.find(x => x.name === file)||{}).code || ""
		: isString(() => service.code)
			? service.code
			: "";

	return {
		code,
		name: service.name,
		id: service.id,
		filename: file
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
	console.log(`Current Service reset!`);
	currentFile = currentService = null;
	state.changedFiles = {};
};

export {
	getCodeFromService, getCurrentFile, getCurrentService,
	getCurrentFolder, setCurrentFolder,
	getState, setState, resetState
};
