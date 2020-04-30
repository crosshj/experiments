import {
	attach, trigger
} from '../Listeners.mjs';

import {
	isSupported
} from '../Templates.mjs'

let locked;
let lsLocked = localStorage.getItem("previewLocked");
if(lsLocked === null){
	lsLocked = "true"
	localStorage.setItem("previewLocked", "true");
}
locked = lsLocked === "true";


let currentFile;
let currentFileName;
let currentView = localStorage.getItem('rightPaneSelected');

let backupForLock = {
	currentFile: '',
	currentFileName: ''
};


const PROMPT = '\x1B[38;5;14m \r∑ \x1B[0m';

const commands = [{
	name: 'showCurrentFolder',
	about: 'Shows the path of the current folder',
	alias: ['pwd'],
	required: [],
	args: []
}, {
	name: 'changeCurrentFolder',
	about: 'Switches the current folder',
	alias: ['cd'],
	required: ['folderPath'],
	args: ['folderPath']
}, {
	name: 'addFolder',
	about: 'Makes a folder in the current folder or parent of choice',
	alias: ['md', 'mkdir'],
	required: ['folderName'],
	args: ['folderName', 'parent']
}, {
	name: 'readFolder',
	about: 'Lists the contents of the current folder or parent of choice',
	alias: ['ls', 'dir'],
	required: [],
	args: ['parent']
}, {
	name: 'deleteFolder',
	about: 'Delete a folder. Use a folder in current folder or include path in name.',
	alias: ['df'],
	required: ['folderName'],
	args: ['folderName']
}, {
	name: 'renameFolder',
	about: 'Rename folder. Use a folder in current folder or include path in name.',
	alias: ['rf'],
	required: ['oldName', 'newName'],
	args: ['oldName', 'newName']
}, {
	name: 'moveFolder',
	about: 'Moves folder to destination',
	alias: ['mv'],
	required: ['target', 'destination'],
	args: ['target', 'destination']
}, {
	name: 'moveFile',
	about: 'Moves file to destination',
	alias: ['mf'],
	required: ['target', 'destination'],
	args: ['target', 'destination']
}];

//NOTE: these are mostly already handled in ../Terminal.mjs
//TODO: migrate to this pattern
const manageOps = [
	"addFile", "renameFile", "deleteFile",
	"renameProject"
];
const projectOps = [
	"cancel", "create", "read", "update", "delete",
	"manage", "monitor", "persist",
	"fullscreen", "help"
];
const eventsHandledAlready = [...manageOps, ...projectOps];

const terminalTrigger = (write, command, callback) => {

	let preventDefault = true;
	const [ op, ...args] = command.split(' ');

	if(['help', '?'].includes(op)){
		preventDefault = true;
		write(`\n\nThese might work:\n\n\r   ${
			[
				...eventsHandledAlready,
				...commands.map(x => [...x.alias, x.name].join(' | '))
			]
				.filter(x => x !== "help")
				.join('\n\r   ')
		}\n`);
		callback && callback();
		return preventDefault;
	}

	if(eventsHandledAlready.includes(op)){
		preventDefault = false;
		return preventDefault;
	}

	const currentCommand = commands.find(x => {
		const opMatchesName = op.toLowerCase() === x.name.toLowerCase();
		const opMatchesAlias = x.alias.length > 0
			&& x.alias.map(a=>a.toLowerCase()).includes(op.toLowerCase());
		return opMatchesName || opMatchesAlias;
	});

	if(!currentCommand){
		write(`\nCommand not found: ${op}\n`);
		callback && callback();
		return preventDefault;
	}

	if(args[0] === "?"){
		preventDefault = true;
		write(`\n\nABOUT: ${currentCommand.about}`);
		write(
			`\nUSAGE: ( ${
				[...currentCommand.alias, currentCommand.name].join(' | ')
			} ) ${currentCommand.args.join(" ") || "{no args}"}`
		);
		write(`\nREQUIRED: ${currentCommand.required.join(", ") || "none"}`);
		write(`\n`);
		callback && callback();
		return preventDefault;
	}


	const eventArgs = {};
	for(var i=0, len=currentCommand.args.length; i<len; i++){
		const currentCommandArg = currentCommand.args[i];
		eventArgs[currentCommandArg] = args[i] || null;
	}
	const missingArgs = currentCommand.required
		.map(x => eventArgs[x] ? null : x)
		.filter(x => !!x);

	if(missingArgs.length > 0 ){
		preventDefault = true;
		write(`\nMissing arguments: ${missingArgs.join(', ')}\n`);
		callback && callback();
		return preventDefault;
	}

	const cb = (err, res) => {
		if(err){
			write(`\nERROR: ${err}\n`);
			callback && callback();
			return;
		}
		write(`\n${res||'Finished.'}\n`);
		callback && callback();
	};

	trigger({
		type: currentCommand.name,
		params: { ...eventArgs, ...{ callback: cb }},
		source: 'Terminal'
	});
	return preventDefault;
};

/// ----------------------------------------------------------------------------

const viewSelectHandler = ({ viewUpdate }) => (event) => {
	const { type, detail } = event;
	const { view } = detail;

	currentView = view;
	localStorage.setItem('rightPaneSelected', view);

	if(!currentFile){
		// TODO: bind and conditionally trigger render
		// console.log({ type, op, id });
		const doc = `
			<html>
				<body style="margin: 20%; color: white;">No Preview</body>
			</html>
		`;
		viewUpdate({ type, doc, docName: currentFileName, ...event.detail });
	}

	const code = currentFile;
	const name = currentFileName;
	const isHTML = code.includes('<html>');
	const isSVG = code.includes('</svg>');
	const isJSX = (name).includes('jsx');
	const isSVC3 = code.includes('/* svcV3 ');
	const hasTemplate = isSupported({ name, contents: code });

	if(!isSVG && !isHTML && !isJSX && !isSVC3 && !hasTemplate){
		code = `<div class="no-preview">No preview available.</div>`;
	}
	const doc = isHTML || isJSX || isSVC3 || hasTemplate
		? code
		: `
		<html>
			<style>
				.no-preview {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 5vw;
					color: #666;
				}
				body {
					margin: 0px;
					margin-top: 40px;
					height: calc(100vh - 40px);
					overflow: hidden;
					color: #ccc;
					font-family: sans-serif;
				}
			</style>
			<body">
				<pre>${code}</pre>
			</body>
		</html>
	`;
	viewUpdate({ supported: hasTemplate, type, doc, docName: currentFileName, locked, ...event.detail });
	return;
};

const fileSelectHandler = ({ viewUpdate, getCurrentService }) => (event) => {
	const { type, detail } = event;
	const { op, id, name, next } = detail;
	if(type==="fileClose" && !next){
		//TODO: this should be a bit more nuanced
		return;
	}
	let code;
	try {
		const service = getCurrentService();
		const selectedFile = service.code.find(x => x.name === (next || name));
		({ code } = selectedFile);
	} catch(e) {
		console.error('could not find the file!');
		return;
	}

	// bind and conditionally trigger render
	// for instance, should not render some files
	const isHTML = code.includes('<html>');
	const isSVG = code.includes('</svg>');
	const isJSX = (name||next).includes('jsx');
	const isSVC3 = code.includes('/* svcV3 ');
	const hasTemplate = isSupported({ name, contents: code });

	if(!isSVG && !isHTML && !isJSX && !isSVC3 && !hasTemplate){
		code = `<div class="no-preview">No preview available.</div>`;
	}
	const doc = isHTML || isJSX || isSVC3 || hasTemplate
		? code
		: `
		<html>
			<style>
				.no-preview {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					font-size: 5vw;
					color: #666;
				}
				body {
					margin: 0px;
					margin-top: 40px;
					height: calc(100vh - 40px);
					overflow: hidden;
					color: #ccc;
					font-family: sans-serif;
				}
			</style>
			<body">
				<pre>${code}</pre>
			</body>
		</html>
	`;
	if(!locked){
		currentFile = doc;
		currentFileName = name||next;
	} else {
		backupForLock.currentFile = doc;
		backupForLock.currentFileName = name||next;
	}
	if(doc && currentView === "preview"){
		viewUpdate({ supported: hasTemplate, type, locked, doc, docName: next || name, ...event.detail });
	}
};

const fileChangeHandler = ({ viewUpdate, getCurrentService }) => (event) => {
	const { type, detail } = event;
	let { name, id, file, code } = detail;

	const isHTML = code.includes('<html>');
	const isSVG = code.includes('</svg>');
	const isJSX = file.includes('jsx');
	const isSVC3 = code.includes('/* svcV3 ');
	const hasTemplate = isSupported({ name: file, contents: code });

	//debugger;
	if(!isSVG && !isHTML && !isJSX && !isSVC3 && !hasTemplate){
		code = `<div class="no-preview">No preview available.</div>`;
	}
	const doc = isHTML || isJSX || isSVC3 || hasTemplate
	? code
	: `
	<html>
		<style>
			.no-preview {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 5vw;
				color: #666;
			}
			body {
				margin: 0px;
				margin-top: 40px;
				height: calc(100vh - 40px);
				overflow: hidden;
				color: #ccc;
				font-family: sans-serif;
			}
		</style>
		<body">
			<pre>${code}</pre>
		</body>
	</html>
`;
	if(!locked){
		currentFile = doc;
		currentFileName = file;
	} else {
		backupForLock.currentFile = doc;
		backupForLock.currentFileName = file;
	}
	if(doc && currentView === "preview"){
		viewUpdate({ supported: hasTemplate, type, locked, doc, docName: file, ...event.detail });
	}
};

const terminalActionHandler = ({ terminalActions, viewUpdate }) => (event) => {
	const { type, detail } = event;
	const { action } = detail;
	if(type==="termMenuAction" && action === "lock"){
		localStorage.setItem("previewLocked", !locked);
		locked = !locked;
	}
	terminalActions({ type, detail, locked, ...event.detail });

	if(locked){
		return;
	}
	debugger

	if(backupForLock.currentFile){
		currentFile = backupForLock.currentFile;
		currentFileName = backupForLock.currentFileName;
	}

	if(!currentFile){ return; }

	const isHTML = currentFile.includes('<html>');
	const isSVG = currentFile.includes('</svg>');
	const isJSX = currentFileName.includes('jsx');
	const isSVC3 = currentFile.includes('/* svcV3 ');
	const hasTemplate = isSupported({ name: currentFileName, contents: currentFile });

	let code;
	//debugger;
	if(!isSVG && !isHTML && !isJSX && !isSVC3 && !hasTemplate){
		code = `<div class="no-preview">No preview available.</div>`;
	}
	const doc = isHTML || isJSX || isSVC3 || hasTemplate
	? currentFile
	: `
	<html>
		<style>
			.no-preview {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 5vw;
				color: #666;
			}
			body {
				margin: 0px;
				margin-top: 40px;
				height: calc(100vh - 40px);
				overflow: hidden;
				color: #ccc;
				font-family: sans-serif;
			}
		</style>
		<body">
			<pre>${code}</pre>
		</body>
	</html>
`;

	viewUpdate({
		type, locked, supported: hasTemplate,
		doc,
		docName: currentFileName,
		...event.detail
	});

};

function attachEvents({ write, viewUpdate, getCurrentService, terminalActions }){
	// write('\x1B[2K');
	// write('\rEvent system attached.\n');
	// write(`\n${PROMPT}`);

	attach({
		name: 'Terminal',
		eventName: 'viewSelect',
		listener: viewSelectHandler({ viewUpdate })
	});

	attach({
		name: 'Terminal',
		eventName: 'fileSelect',
		listener: fileSelectHandler({ viewUpdate, getCurrentService })
	});
	attach({
		name: 'Terminal',
		eventName: 'fileClose',
		listener: fileSelectHandler({ viewUpdate, getCurrentService })
	});
	attach({
		name: 'Terminal',
		eventName: 'fileChange',
		listener: fileChangeHandler({ viewUpdate, getCurrentService })
	});
	attach({
		name: 'Terminal',
		eventName: 'termMenuAction',
		listener: terminalActionHandler({ terminalActions, viewUpdate })
	});
	attach({
		name: 'Terminal',
		eventName: 'operations',
		listener: (event) => {
			if(event.detail.operation !== "persist"){ return; }
			const hasTemplate = isSupported({ name: currentFileName, contents: currentFile });
			viewUpdate({
				supported: hasTemplate,
				type: 'forceRefreshOnPersist',
				locked: false,
				doc: currentFile,
				docName: currentFileName,
				...event.detail
			});
		}
	});

	return (command, callback) => terminalTrigger(write, command, callback);
}

function attachTrigger({ target, domEvents, type, selector, handler }){
	domEvents.forEach(de => {
		target.addEventListener(de, (event) => {
			if(!selector(event)){ return true; }
			const params = handler(event);
			trigger({
				type,
				params,
				source: 'Terminal'
			});
		});
	});
}

export {
	attachEvents,
	attachTrigger
};
