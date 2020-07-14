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
		listener: (e, ...args) => {
			const editorDom = document.querySelector('#editor .CodeMirror');
			if(!editorDom.contains(e.target)){ return true; }
			debugger;
			e.preventDefault();
			console.log(args);
			console.log('editor right click menu')
			return false;
		},
		options: {
			capture: true
		}
	});
}

export {
	attachListener, ChangeHandler
};
