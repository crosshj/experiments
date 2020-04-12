import { attach } from '../Listeners.mjs';

function attachListener({
	hideBar,
	showBar
}){
	attach({
		name: 'Loading Indicator',
		eventName: 'operations',
		listener: showBar
	});
	attach({
		name: 'Loading Indicator',
		eventName: 'operationDone',
		listener: hideBar
	});
}

export {
	attachListener
};
