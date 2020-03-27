import { attach } from '../Listeners.mjs';


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

export {
	attachListener
};
