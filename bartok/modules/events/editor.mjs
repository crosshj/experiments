import { attach } from '../Listeners.mjs';
import { setState, getState } from '../state.mjs';

function attachListener(switchEditor){
	const listener = async function (e) {
		const { name, next } = e.detail;
		if(e.type === "fileClose" && !next){
			return;
		}
		switchEditor(next || name);
	};
	attach({
		name: 'EditorView',
		eventName: 'fileSelect',
		listener
	});
	attach({
		name: 'EditorView',
		eventName: 'fileClose',
		listener
	});
}

const ChangeHandler = (doc, changeObj) => {
	const { code, name, id } = doc;
	// TODO: if handler already exists, return it
	const changeThis = (contents) => {
		const file = setState({
			name, id,
			code: contents,
			prevCode: code
		});

		const event = new CustomEvent('fileChange', {
			bubbles: true,
			detail: { name, id, file, code }
		});
		document.body.dispatchEvent(event);
	};

	return (editor, changeObj) => {
		//console.log('editor changed');
		console.log(changeObj);
		changeThis(editor.getValue());
	};
};

export {
	attachListener, ChangeHandler
};