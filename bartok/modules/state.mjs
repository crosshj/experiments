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

let currentService;
let currentFile;
function getCodeFromService(service, file){
	if(!service){
		service = currentService || {};
	} else {
		currentService = service;
	}
	if(!file){
		currentFile = currentFile || getDefaultFile(service);
		file = currentFile;
	} else {
		currentFile = file;
	}
	const code = Array.isArray(service.code)
		? (service.code.find(x => x.name === file)||{}).code || ""
		: service.code;
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
	const { name, id, code, prevCode } = change;
	if(!state.changedFiles[id+name]){
		state.changedFiles[id+name] = [{
			name, id, code: prevCode
		}];
	}
	state.changedFiles[id+name]
		.push({ name, id, code });
	return currentFile;
}

const getCurrentFile = () => currentFile;
const getCurrentService = () => currentService;

const resetState = () => {
	currentFile = currentService = null;
	state.changedFiles = {};
};

export {
	getCodeFromService, getCurrentFile, getCurrentService,
	getState, setState, resetState
};
