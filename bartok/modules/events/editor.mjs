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
			: { name: x }
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
		console.error('Editor ignored a context-select event');
		return;
	}
};

function attachListener(switchEditor){
	const listener = async function (e) {
		const { name, next } = e.detail;
		if(e.type === "fileClose" && !next){
			return;
		}
		switchEditor(next || name);
	};
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
