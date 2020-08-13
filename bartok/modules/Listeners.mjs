const listeners = {};

function attach({
	name, listener, eventName, options
}){
	const listenerName = `${eventName}__${name}`;
	if(listeners[listenerName]){
		return;
	}
	window.addEventListener(eventName, listener, options);
	listeners[listenerName] = listener;
}

function remove({
	name, eventName, options
}){
	const listenerName = `${eventName}__${name}`;
	window.removeEventListener(eventName, listeners[listenerName], options);
	delete listeners[listenerName];
}

function list(){
	return Object.keys(listeners);
}

//TODO: should bind triggers the same way that listeners are bound

// triggerAttach
// triggerRemove
// triggersList

function trigger({ type, params, source }){
	const event = new CustomEvent(type, {
		bubbles: true,
		detail: { ...params, ...{ source }}
	});
	window.dispatchEvent(event);
}

export {
	attach, remove, list, trigger
};
