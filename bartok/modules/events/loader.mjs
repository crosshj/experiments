import { attach } from '../Listeners.mjs';

function attachListener({
	hideBar,
	showBar
}){
	attach({
		name: 'LoaderBar',
		eventName: 'operations',
		listener: showBar
	});
	attach({
		name: 'LoaderBar',
		eventName: 'operationDone',
		listener: hideBar
	});
}

export {
	attachListener
};
