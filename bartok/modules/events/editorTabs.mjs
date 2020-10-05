import { attach, attachTrigger } from '../Listeners.mjs';
import { getDefaultFile } from '../state.mjs';
let tabs = [];

function clearLastTab({ tabs, removeTab }){
	const lastTab = tabs[tabs.length - 1];
	if(lastTab.changed) return;
	tabs = tabs.filter(t => t.id !== lastTab.id);
	removeTab(lastTab);
	return { tabs, cleared: lastTab };
}

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
		if(!foundTab){

		}
	}
	return { foundTab, tabsToUpdate };
}

function triggerCloseTab(event, fileCloseTrigger){
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
		: (tabs.filter(x => x.active)||[{}])[0].name;

	fileCloseTrigger({
		detail: { name, next }
	});

}




const fileCloseHandler = ({
	event, updateTab, removeTab
}) => {
	const { name, next } = event.detail;

	const found = tabs.find(x => x.name === name);
	tabs = tabs.filter(x => x.name !== name);
	sessionStorage.setItem('tabs', JSON.stringify(tabs));

	removeTab(found);

	if(!next){ return; }
	const nextTab = tabs.find(x => x.name === next || x.systemDocsName === next);
	if(!nextTab){
		return;
	}
	nextTab.active = true;
	sessionStorage.setItem('tabs', JSON.stringify(tabs));

	updateTab(nextTab);
};

const clickHandler = ({
	event, container, triggers
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
		triggerCloseTab(event, triggers['fileClose']);
		event.preventDefault();
		return;
	}
	const id = event.target.id;
	const foundTab = tabs.find(x => x.id === id);
	if(tabs.filter(x => x.active).map(x => x.id).includes(id)){
		return;
	}

	//TODO: keep track of the order which tabs are clicked

	// const { tabsToUpdate, foundTab } = getTabsToUpdate(name);
	// tabsToUpdate.map(updateTab);

	triggers['fileSelect']({
		detail: {
			name: foundTab.name
		}
	})
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
	let systemDocsName;
	if(name.includes('system::')){
		systemDocsName = {
			'add-service-folder': 'Open Folder',
			'connect-service-provider': 'Connect to a Provider',
			'open-previous-service': 'Open Previous Service',
			'open-settings-view': 'Settings'
		}[name.replace('system::', '')];
	}
	let id = 'TAB' + Math.random().toString().replace('0.', '');

	let { tabsToUpdate, foundTab } = getTabsToUpdate(name);
	if(foundTab){
		tabsToUpdate.map(updateTab);
		sessionStorage.setItem('tabs', JSON.stringify(tabs));
		return;
	}

	createTab({
		name, active: true, id, changed
	});
	const { cleared, tabs: newTabs } = firstLoad ? {} : (clearLastTab({ tabs, removeTab }) || {});
	if(newTabs) tabs = newTabs;
	if(cleared) tabsToUpdate = tabsToUpdate.filter(t => t.id !== cleared.id);
	tabsToUpdate.map(updateTab);
	tabs.push({
		name, systemDocsName,
		active: true, id, changed
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
	'open-previous-service': systemDocsHandler,
	'open-settings-view': systemDocsHandler
};

function attachListener(
	container,
	{ initTabs, createTab, updateTab, removeTab }
){
	const triggers = {
		'fileClose': attachTrigger({
			name: 'Tab Bar',
			eventName: 'fileClose',
			type: 'raw'
		}),
		'fileSelect': attachTrigger({
			name: 'Tab Bar',
			eventName: 'fileSelect',
			type: 'raw'
		})
	};
	const listener = async function (event) {
		const showMenu = () => window.showMenu;

		handlers[event.type] && handlers[event.type]({
			event, container, initTabs, createTab, updateTab, removeTab, showMenu, triggers
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
		eventName: 'open-previous-service',
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