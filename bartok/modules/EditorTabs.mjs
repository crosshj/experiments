import { attachListener } from './events/editorTabs.mjs';

function log(){
	return console.log.call(null, arguments.map(x =>
		JSON.stringify(x, null, 2)
	));
}

const removeTab = (parent) => (tabDef) => {
	//console.log(tabDef)
	if(tabDef.parentNode){
		tabDef.parentNode.removeChild(tabDef);
		return;
	}
	const child = parent.querySelector(`#TAB${tabDef.id}`);
	console.log(child)
	child && parent.removeChild(child)
};

const createTab = (parent) => (tabDef) => {
	const tab = document.createElement('div');
	tab.id = 'TAB' + Math.random().toString().replace('0.', '');
	tab.classList.add('tab');
	if(tabDef.active){
		tab.classList.add('active');
	}
	tab.innerHTML = `
		<span style="pointer-events: none;">${tabDef.name}</span>
	`;
	parent.appendChild(tab);
};

const initTabs = (parent) => (tabDefArray=[]) => {
	Array.from(parent.querySelectorAll('.tab'))
		.map(removeTab(parent));
	tabDefArray.map(createTab(parent))
};


let tabsContainer;
let tabsList;
function EditorTabs(tabsArray /* = [{ name: "index.js", active: true }] */){
	if(tabsContainer){
		//console.log('already exists');
		tabsList = tabsList || tabsContainer.querySelector('#editor-tabs');
		//should not be doing this, rely on event instead!!!
		//tabsArray && initTabs(tabsList)(tabsArray);
		return tabsContainer;
	}
	tabsContainer = document.createElement('div');
	tabsContainer.innerHTML = `
		<div class="scrollable hide-native-scrollbar" id="editor-tabs-container">
			<div id="editor-tabs" class="row no-margin">
			</div>
			<div
				class="invisible scrollbar horizontal fade"
				style="position: absolute; width: 575px; height: 3px; left: 0px; bottom: 0px;"
			>
				<div
					class="slider"
					style="position: absolute; top: 0px; left: 0px; height: 3px; will-change: transform; width: 508px;"
				>
				</div>
			</div>
		</div>
	`;

	attachListener(tabsContainer, {
		initTabs: initTabs(parent),
		createTab: createTab(tabsContainer),
		updateTab: () => console.log('updateTab'),
		removeTab: () => console.log('removeTab')
	});

	tabsList = tabsList || tabsContainer.querySelector('#editor-tabs');
	//should not be doing this, rely on event instead!!!
	//tabsArray && initTabs(tabsList)(tabsArray);
	return tabsContainer;
}

export default EditorTabs;
