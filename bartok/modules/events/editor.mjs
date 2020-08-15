import { attach } from '../Listeners.mjs';
import { setState, getState } from '../state.mjs';


const ChangeHandler = (doc) => {
	const { code, name, id, filename } = doc;
	// TODO: if handler already exists, return it
	const changeThis = (contents, changeObj) => {
		const file = setState({
			name, id, filename,
			code: contents,
			prevCode: code
		});

		const event = new CustomEvent('fileChange', {
			bubbles: true,
			detail: { name, id, file, code: contents }
		});
		document.body.dispatchEvent(event);
	};

	return (editor, changeObj) => {
		//console.log('editor changed');
		//console.log(changeObj);
		changeThis(editor.getValue(), changeObj);
	};
};

// this is really a trigger
const CursorActivityHandler = ({ line, column }) => {
	const event = new CustomEvent('cursorActivity', {
		bubbles: true,
		detail: { line, column }
	});
	document.body.dispatchEvent(event);
}

const contextMenuHandler = ({ showMenu }={}) => (e) => {
	const editorDom = document.querySelector('#editor .CodeMirror');
	if(!editorDom){ return true; }
	if(!editorDom.contains(e.target)){ return true; }
	e.preventDefault();

	const listItems = [
		'Change All Occurences', 'Format Selection', 'Format Document',
		'seperator',
		'Cut', 'Copy', 'Paste',
		'seperator',
		'Command Palette...'
	]
		.map(x => x === 'seperator'
			? 'seperator'
			: { name: x, disabled: true }
		);
	let data;
	try {
		data = {}
	} catch(e) {}

	if(!data){
		console.error('some issue finding data for this context click!')
		return;
	}

	showMenu()({
		x: e.clientX,
		y: e.clientY,
		list: listItems,
		parent: 'Editor',
		data
	});
	return false;
};

const contextMenuSelectHandler = ({ newFile } = {}) => (e) => {
	const { which, parent, data } = (e.detail || {});
	if(parent !== 'Editor'){
		//console.log('Editor ignored a context-select event');
		return;
	}
};

let firstLoad = true;
function attachListener(switchEditor){
	const listener = async function (e) {
		if([
			'add-service-folder', 'connect-service-provider'
			].includes(e.type)
		){
			switchEditor(e.type, "systemDoc");
			return;
		}
		if(e.type === "noServiceSelected"){
			switchEditor(null, "nothingOpen");
			return;
		}
		const { name, next } = e.detail;
		let savedFileName;
		if(e.type === "fileClose" && !next){
			savedFileName = sessionStorage.setItem('editorFile', 'noFileSelected');
			switchEditor(null, "nothingOpen");
			return;
		}
		const isFileSelect = e.type === "fileSelect";
		if(firstLoad && isFileSelect){
			savedFileName = sessionStorage.getItem('editorFile');
			firstLoad = false;
			if(savedFileName === 'noFileSelected'){
				switchEditor(null, "nothingOpen");
				return;
			}
		}
		if(!savedFileName){
			sessionStorage.setItem('editorFile', next || name);
		}
		switchEditor(savedFileName || next || name);
	};
	attach({
		name: 'Editor',
		eventName: 'add-service-folder',
		listener
	});
	attach({
		name: 'Editor',
		eventName: 'connect-service-provider',
		listener
	});
	attach({
		name: 'Editor',
		eventName: 'noServiceSelected',
		listener
	});
	attach({
		name: 'Editor',
		eventName: 'fileSelect',
		listener
	});
	attach({
		name: 'Editor',
		eventName: 'fileClose',
		listener
	});
	attach({
		name: 'Editor',
		eventName: 'contextmenu',
		listener: contextMenuHandler({
			showMenu: () => window.showMenu
		}),
		options: {
			capture: true
		}
	});
	attach({
		name: 'Editor',
		eventName: 'contextmenu-select',
		listener: contextMenuSelectHandler()
	});
}

export {
	attachListener, ChangeHandler, CursorActivityHandler
};
