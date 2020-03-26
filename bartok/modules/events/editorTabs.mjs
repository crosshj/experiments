import { attach } from '../Listeners.mjs';

let tabs = [];

const clickHandler = ({
	event, container, initTabs, createTab, updateTab, removeTab
}) => {
	if(!container.contains(event.target)){
		//console.log('did not click any tab container element');
		return;
	}
	if(!event.target.classList.contains('tab')){
		//console.log('did not click on a tab element');
		return;
	}
	const tabsToUpdate = [];
	for(var i=0, len=tabs.length; i < len; i++){
		// if tab is equal to clicked tab and not active, change it
		// if tab is active but wasn't clicked, remove active state
	}
	tabsToUpdate.map(updateTab);

	// console.log({ tabEvent: event });
	// console.log({ tabs });
};

const handlers = {
	click: clickHandler
};

function attachListener(
	container,
	{ initTabs, createTab, updateTab, removeTab }
){
	const listener = async function (event) {
		handlers[event.type] && handlers[event.type]({
			event, container, initTabs, createTab, updateTab, removeTab
		});
	};

	attach({
		name: 'EditorTabView',
		eventName: 'treeSelect',
		listener
	});
	attach({
		name: 'EditorTabView',
		eventName: 'tabSelect',
		listener
	});
	attach({
		name: 'EditorTabView',
		eventName: 'click',
		listener
	});
}

export {
	attachListener
};