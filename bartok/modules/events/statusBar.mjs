import { attach } from '../Listeners.mjs';
import { codemirrorModeFromFileType } from '../../../shared/modules/utilities.mjs'
import ext from '../../../shared/icons/seti/ext.json.mjs'

function getFileType(fileName = '') {
	let type = 'default';
	const extension = ((
		fileName.match(/\.[0-9a-z]+$/i) || []
	)[0] || ''
	).replace(/^\./, '');

	//console.log(extension)
	if (ext[extension]) {
		type = ext[extension];
	}
	if (extension === 'bat') {
		type = "bat";
	}
	if (extension === 'scratch') {
		type = "markdown";
	}
	if (extension === 'bugs') {
		type = "markdown";
	}
	if (extension === 'htm' || extension === 'html') {
		type = {
			name: "htmlmixed",
			mimeType: "application/x-ejs"
		};
	}
	return type;
}

function getDefaultFile(service){
	let defaultFile;
	try {
		const packageJson = JSON.parse(
			service.code.find(x => x.name === "package.json").code
		);
		defaultFile = packageJson.main;
	} catch(e){
		//debugger;
	}
	return defaultFile || "index.js";
}

// EVENTS -------------------------------------------------------------

const operationDone = ({
	setLineNumber, setColNumber, setTabSize, setDocType
}) =>
	(event) => {
		const { detail } = event;
		const { op, id, result } = detail;
		// only care about service read with id
		if(op !== "read" || !id){
			return;
		}
		//have to figure out what file gets loaded by default (boo!)
		const defaultFile = getDefaultFile(result[0]);
		const fileType = getFileType(defaultFile);
		const mode = codemirrorModeFromFileType(fileType);
		setDocType(mode);
		setLineNumber(1);
		setColNumber(1);
	};
const fileSelect = ({
	setLineNumber, setColNumber, setTabSize, setDocType
}) =>
	(event) => {
		const { detail } = event;
		const { name } = detail;
		if(!name){
			return;
		}
		const fileType = getFileType(name);
		const mode = codemirrorModeFromFileType(fileType);
		setDocType(mode);
		setLineNumber(1);
		setColNumber(1);
	};
const fileClose = ({
	setLineNumber, setColNumber, setTabSize, setDocType
}) =>
	(event) => {
		console.log('status bar listen for fileClose');
	};
const fileChange = ({
	setLineNumber, setColNumber, setTabSize, setDocType
}) =>
	(event) => {
		console.log('status bar listen for fileChange');
	};
const click = ({
	setLineNumber, setColNumber, setTabSize, setDocType
}) =>
	(event) => {
		console.log('status bar listen for click');
	};



const listeners = {
	operationDone, fileSelect, fileClose, fileChange, click
};

function attachListeners({
	setLineNumber, setColNumber, setTabSize, setDocType
}){
	Object.keys(listeners).forEach(key => {
		attach({
			name: 'Status Bar',
			eventName: key,
			listener: listeners[key]({
				setLineNumber, setColNumber, setTabSize, setDocType
			})
		});
	});
}

export {
	attachListeners
};
