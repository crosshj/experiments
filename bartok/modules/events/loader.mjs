import { attach } from '../Listeners.mjs';

function attachListener({
	hideBar,
	showBar
}){
	attach({
		name: 'Indicators',
		eventName: 'operations',
		listener: showBar
	});
	attach({
		name: 'Indicators',
		eventName: 'operationDone',
		listener: hideBar
	});
}

export {
	attachListener
};
