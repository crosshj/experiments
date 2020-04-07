const listeners = {};

function attach({
	name, listener, eventName, options
}){
	const listenerName = `${eventName}-${name}`;
	if(listeners[listenerName]){
		return;
	}
	document.body.addEventListener(eventName, listener, options);
	listeners[listenerName] = listener;
}

function remove({
	name, eventName, options
}){
	const listenerName = `${eventName}-${name}`;
	document.body.removeEventListener(eventName, listeners[listenerName], options);
	delete listeners[listenerName];
}

function list(){
	return Object.keys(listeners);
}

function trigger({ type, params, source }){
	const event = new CustomEvent(type, {
		bubbles: true,
		detail: { ...params, ...{ source }}
	});
	document.body.dispatchEvent(event);
}

export {
	attach, remove, list, trigger
};
