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
	debugger;
	getCurrentService(); //this caues service status to update?

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
const getCurrentService = () => {
	const changedArray = Object.keys(state.changedFiles)
		.map(k => state.changedFiles[k]);
	const mostRecent = changedArray.map(x => x[x.length-1]);

	mostRecent.forEach(m => {
		const found = currentService.code.find(x => x.name === m.filename);
		if(!found){ debugger; }
		found.code = m.code;
	});
	return currentService;
}

const resetState = () => {
	currentFile = currentService = null;
	state.changedFiles = {};
};

export {
	getCodeFromService, getCurrentFile, getCurrentService,
	getState, setState, resetState
};
