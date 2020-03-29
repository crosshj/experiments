import { attach } from '../Listeners.mjs';

const hideServiceMapHandler = (hideServiceMap) => async (event) => {
	console.log('hide services');
	hideServiceMap();
};

const showServiceMapHandler = (showServiceMap) => async (event) => {
	console.log('hide services');
	showServiceMap();
};

function attachListener({
	showServiceMap,
	hideServiceMap
}){
	attach({
		name: 'ServicesView',
		eventName: 'showServicesMap',
		listener: showServiceMapHandler(showServiceMap)
	});
	attach({
		name: 'ServicesView',
		eventName: 'showServiceCode',
		listener: hideServiceMapHandler(hideServiceMap)
	});
}

export {
	attachListener
};
