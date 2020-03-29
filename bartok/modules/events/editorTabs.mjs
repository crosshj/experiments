import { attach } from '../Listeners.mjs';

let tabs = [];

function getDefaultFile(service){
	let defaultFile;
	try {
		const packageJson = JSON.parse(
			service.code.find(x => x.name === "package.json").code
		);
		defaultFile = packageJson.main;
	} catch(e){
		//debugger;
	}
	return defaultFile || "index.js";
}

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

function triggerCloseTab(event){
	let name;
	try{
		name = event.target.closest('.tab').innerText.trim()
	} catch(e) {
		console.log('error trying to handle close tab click');
		console.log(e);
	}
	if(!name){ return; }
	const closedTab = tabs.find(x => x.name === name);
	const nextTabs = tabs.filter(x => x.name !== name);
	const next = closedTab.active
		? (nextTabs[nextTabs.length -1]||{}).name
		: undefined;

	const fileCloseEvent = new CustomEvent('fileClose', {
		bubbles: true,
		detail: { name, next }
	});
	document.body.dispatchEvent(fileCloseEvent);
}

const fileCloseHandler = ({
	event, container, initTabs, createTab, updateTab, removeTab
}) => {
	const { name, next } = event.detail;

	const found = tabs.find(x => x.name === name);
	tabs = tabs.filter(x => x.name !== name);

	removeTab(found);

	if(!next){ return; }
	const nextTab = tabs.find(x => x.name === next);
	nextTab.active = true;
	updateTab(nextTab);
};

const clickHandler = ({
	event, container, initTabs, createTab, updateTab, removeTab
}) => {
	if(!container.contains(event.target)){
		//console.log('did not click any tab container element');
		return;
	}
	if(
		!event.target.classList.contains('tab') &&
		!event.target.classList.contains('close-editor-action')
	){
		return;
	}

	if(event.target.classList.contains('close-editor-action')){
		triggerCloseTab(event);
		event.preventDefault();
		return;
	}

	const name = event.target.innerText.trim();
	if(tabs.filter(x => x.active).map(x => x.name).includes(name)){
		return;
	}

	//TODO: keep track of the order which tabs are clicked

	// const { tabsToUpdate, foundTab } = getTabsToUpdate(name);
	// tabsToUpdate.map(updateTab);
	const fileSelectEvent = new CustomEvent('fileSelect', {
		bubbles: true,
		detail: { name }
	});
	document.body.dispatchEvent(fileSelectEvent);
};

const fileSelectHandler = ({
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
	const { op, id, result=[] } = event.detail || '';
	if(op !== 'read' || !id){
		return;
	}
	const defaultFile = getDefaultFile(result[0]);
	tabs = [{
		name: defaultFile,
		active: true,
		id: 'TAB' + Math.random().toString().replace('0.', '')
	}];
	initTabs(tabs)
};

const handlers = {
	click: clickHandler,
	fileSelect: fileSelectHandler,
	fileClose: fileCloseHandler,
	operationDone: operationDoneHandler
};

function attachListener(
	container,
	{ initTabs, createTab, updateTab, removeTab }
){
	const listener = async function (event) {
		//console.log(event.type)
		// await something here??
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
		eventName: 'fileSelect',
		listener
	});

	attach({
		name: 'EditorTabView',
		eventName: 'fileClose',
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