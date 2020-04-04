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
		id: service.id
	};
}

const getCurrentFile = () => currentFile;
const getCurrentService = () => currentService;

export {
	getCodeFromService, getCurrentFile, getCurrentService
};
