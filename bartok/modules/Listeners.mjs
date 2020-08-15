const listeners = {};
const triggers = {};

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


/*
future todo:

- when an event is triggered, don't create a custom event if event listeners exist already for that event
- instead, just trigger those

- there should be an uber listener instead of a bunch of click listeners added

*/


function trigger({ type, params, source }){
	console.log(`triggering event: ${type}`);
	const event = new CustomEvent(type, {
		bubbles: true,
		detail: { ...params, ...{ source }}
	});
	window.dispatchEvent(event);
}

let triggerClickListener;
function attachTrigger({
	name, // the module that is attaching the listener
	type='click', // the input event name, eg. "click"
	eventName, // the name of the event(s) that triggers are attached for (can also be a function or an array)
	filter // a function that will filter out input events that are of no concern
}){
	if(type !== 'click') {
		console.error(`triggering based on ${type} not currently supported`);
		return;
	}

	const triggerName = `${eventName}__${name}`;
	const listener = (event) => {
		const foundTrigger = Object.keys(triggers)
			.map(key => ({ key, ...triggers[key] }) )
			.find(t => {
				if(t.key !== triggerName) return;
				const filterOkay = t.filter && typeof t.filter === "function" && t.filter(event);
				return filterOkay;
			});
		if(!foundTrigger) return;
		const { eventName: type } = foundTrigger;
		const params = {};
		const source ={};
		trigger({ type, params, source });
	};
	const options = {};
	triggerClickListener = triggerClickListener ||
		window.addEventListener(type, listener, options);
	triggers[triggerName] = {
		filter, eventName
	};

}
function removeTrigger({
	name, eventName
}){
	const triggerName = `${eventName}__${name}`;
	delete triggers[triggerName];
	// probably should never do this since something will always be listening for a click
	// (and clicks are all that is supported right now)
	// (and there is really only one click listener for triggers)
	//window.removeEventListener(eventName, listeners[listenerName], options);
}
function listTriggers(){
	return Object.keys(triggers);
}

window.listTriggers = listTriggers;
window.listListeners = list;

export {
	trigger, //deprecate exporting this?
	attach, remove, list,
	attachTrigger, removeTrigger, listTriggers
};
