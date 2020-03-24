import { attach } from '../Listeners.mjs';


function attachListener(switchEditor){
	const listener = async function (e) {
		const fileName = e.detail.name;
		switchEditor(fileName);
	};
	attach({
		name: 'EditorView',
		eventName: 'treeSelect',
		listener
	});
	attach({
		name: 'EditorView',
		eventName: 'tabSelect',
		listener
	});
}

export {
	attachListener
};
