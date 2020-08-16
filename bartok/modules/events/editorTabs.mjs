import { attach } from '../Listeners.mjs';
import { getDefaultFile } from '../state.mjs';
let tabs = [];

function getTabsToUpdate(name) {
	const tabsToUpdate = [];
	let foundTab;
	for (var i = 0, len = tabs.length; i < len; i++) {
		if (name === tabs[i].name){
			foundTab = tabs[i];
		}
		// update: if tab exists and not active, activate it
		if (name === tabs[i].name && !tabs[i].active) {
			tabs[i].active = true;
			tabsToUpdate.push(tabs[i]);
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
		name = event.target.dataset.name.trim()
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
	sessionStorage.setItem('tabs', JSON.stringify(tabs));

	removeTab(found);

	if(!next){ return; }
	const nextTab = tabs.find(x => x.name === next);
	nextTab.active = true;
	sessionStorage.setItem('tabs', JSON.stringify(tabs));

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
	const firstLoad = tabs.length < 1;
	// TODO: need a finer defintion of first load
	// because all tabs may be exited later in usage
	// if(firstLoad){
	// 	return;
	// }

	const { name, changed } = event.detail;
	let id;

	const { tabsToUpdate, foundTab } = getTabsToUpdate(name);
	tabsToUpdate.map(updateTab);

	if(foundTab){
		sessionStorage.setItem('tabs', JSON.stringify(tabs));
		return;
	}

	id = 'TAB' + Math.random().toString().replace('0.', '');
	createTab({
		name, active: true, id, changed
	});
	tabs.push({
		name, active: true, id, changed
	});
	sessionStorage.setItem('tabs', JSON.stringify(tabs));
};

const fileChangeHandler = ({
	event, container, initTabs, createTab, updateTab, removeTab
}) => {
	const { file } = event.detail;
	const { foundTab } = getTabsToUpdate(file);
	if(!foundTab){
		console.error(`Could not find a tab named ${file} to update`);
		return;
	}
	foundTab.changed = true;
	[foundTab].map(updateTab);
};

const operationDoneHandler = ({
	event, container, initTabs, createTab, updateTab, removeTab
}) => {
	const { op, id, result=[] } = event.detail || '';
	if(op === "update"){
		tabs.forEach(t => delete t.changed);
		tabs.map(updateTab);
		return;
	}

	if(op !== 'read' || !id){
		return;
	}
	const storedTabs = (() => {
		try {
			return JSON.parse(sessionStorage.getItem('tabs'));
		} catch(e){}
	})();
	if(storedTabs){
		tabs = storedTabs;
	} else {
		const defaultFile = getDefaultFile(result[0]);
		tabs = [{
			name: defaultFile,
			active: true,
			id: 'TAB' + Math.random().toString().replace('0.', '')
		}];
	}

	initTabs(tabs)
};

const contextMenuHandler = ({ event, showMenu }) => {
	const editorDom = document.querySelector('#editor-tabs-container');
	if(!editorDom.contains(event.target)){ return true; }
	event.preventDefault();

	//TODO: maybe these should be defined in UI Module
	const listItems = [
		'Close', 'Close Others', 'Close to the Right', 'Close Saved', 'Close All',
		'seperator',
		'Copy Path', 'Copy Relative Path',
		'seperator',
		'Reveal in Side Bar',
		'seperator',
		'Keep Open', 'Pin',
	]
		.map(x => x === 'seperator'
			? 'seperator'
			: { name: x, disabled: true }
		);
	let data;
	try {
		data = {}
	} catch(e) {}

	if(!data){
		console.error('some issue finding data for this context click!')
		return;
	}

	showMenu()({
		x: event.clientX,
		y: event.clientY,
		list: listItems,
		parent: 'Tab Bar',
		data
	});
	return false;
};

const contextMenuSelectHandler = ({ event, newFile }) => {
	const { which, parent, data } = (event.detail || {});
	if(parent !== 'Tab Bar'){
		//console.log('Tab Bar ignored a context-select event');
		return;
	}
};

const systemDocsHandler = ({
	event, container, initTabs, createTab, updateTab, removeTab
}) => {
	const systemDocsTabEvent = {
		detail: {
			name: `system::` + event.type
		}
	};
	fileSelectHandler({
		event: systemDocsTabEvent,
		container, initTabs, createTab, updateTab, removeTab
	});
}

const handlers = {
	'click': clickHandler,
	'fileSelect': fileSelectHandler,
	'fileClose': fileCloseHandler,
	'fileChange': fileChangeHandler,
	'operationDone': operationDoneHandler,
	'contextmenu': contextMenuHandler,
	'contextmenu-select': contextMenuSelectHandler,
	'add-service-folder': systemDocsHandler,
	'connect-service-provider': systemDocsHandler,
	'open-settings-view': systemDocsHandler
};

function attachListener(
	container,
	{ initTabs, createTab, updateTab, removeTab }
){
	const listener = async function (event) {
		//console.log(event.type)
		// await something here??
		const showMenu = () => window.showMenu;

		handlers[event.type] && handlers[event.type]({
			event, container, initTabs, createTab, updateTab, removeTab, showMenu
		});
	};

	attach({
		name: 'Tab Bar',
		eventName: 'open-settings-view',
		listener
	});
	attach({
		name: 'Tab Bar',
		eventName: 'add-service-folder',
		listener
	});
	attach({
		name: 'Tab Bar',
		eventName: 'connect-service-provider',
		listener
	});

	attach({
		name: 'Tab Bar',
		eventName: 'operationDone',
		listener
	});

	attach({
		name: 'Tab Bar',
		eventName: 'fileSelect',
		listener
	});

	attach({
		name: 'Tab Bar',
		eventName: 'fileClose',
		listener
	});

	attach({
		name: 'Tab Bar',
		eventName: 'fileChange',
		listener
	});

	attach({
		name: 'Tab Bar',
		eventName: 'click',
		listener
	});

	attach({
		name: 'Tab Bar',
		eventName: 'contextmenu',
		listener
	});

	attach({
		name: 'Tab Bar',
		eventName: 'contextmenu-select',
		listener
	});
}

export {
	attachListener
};