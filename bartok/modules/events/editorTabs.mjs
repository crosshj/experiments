import { attach } from '../Listeners.mjs';

let tabs = [];

function getTabsToUpdate(name) {
	const tabsToUpdate = [];
	let foundTab;
	for (var i = 0, len = tabs.length; i < len; i++) {
		// update: if tab exists and not active, activate it
		if (name === tabs[i].name && !tabs[i].active) {
			tabs[i].active = true;
			tabsToUpdate.push(tabs[i]);
			foundTab = tabs[i];
		}
		// update: remove active state from active tab
		if (name !== tabs[i].name && tabs[i].active) {
			delete tabs[i].active;
			tabsToUpdate.push(tabs[i]);
		}
	}
	return { foundTab, tabsToUpdate };
}

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
	const name = event.target.innerText.trim();
	const { tabsToUpdate, foundTab } = getTabsToUpdate(name);
	tabsToUpdate.map(updateTab);
};

const treeSelectHandler = ({
	event, container, initTabs, createTab, updateTab, removeTab
}) => {
	const { name } = event.detail;
	let id;

	const { tabsToUpdate, foundTab } = getTabsToUpdate(name);
	tabsToUpdate.map(updateTab);

	if(foundTab){
		return;
	}

	id = 'TAB' + Math.random().toString().replace('0.', '');
	createTab({
		name, active: true, id
	});
	tabs.push({
		name, active: true, id
	});
};

const operationDoneHandler = ({
	event, container, initTabs, createTab, updateTab, removeTab
}) => {
	const { op } = event.detail || '';
	if(op !== 'read'){
		return;
	}
	tabs = [{
		name: 'index.js',
		active: true,
		id: 'TAB' + Math.random().toString().replace('0.', '')
	}];
	initTabs(tabs)
};

const handlers = {
	click: clickHandler,
	treeSelect: treeSelectHandler,
	operationDone: operationDoneHandler
};

function attachListener(
	container,
	{ initTabs, createTab, updateTab, removeTab }
){
	const listener = async function (event) {
		//console.log(event.type)
		handlers[event.type] && handlers[event.type]({
			event, container, initTabs, createTab, updateTab, removeTab
		});
	};

	attach({
		name: 'EditorTabView',
		eventName: 'operationDone',
		listener
	});

	attach({
		name: 'EditorTabView',
		eventName: 'treeSelect',
		listener
	});

	// TODO: probably should be doing this instead of listening to click
	// attach({
	// 	name: 'EditorTabView',
	// 	eventName: 'tabSelect',
	// 	listener
	// });

	// TODO: ACTUALLY!!!!  should make both tree and tab select be fileSelect!!!
	// AND!!! should be listening for fileUpdate, fileRename, fileDelete events!

	attach({
		name: 'EditorTabView',
		eventName: 'click',
		listener
	});
}

export {
	attachListener
};