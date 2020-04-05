import { attachListener } from './events/editorTabs.mjs';
import ext from '/shared/icons/seti/ext.json.mjs'

function log(){
	return console.log.call(null, arguments.map(x =>
		JSON.stringify(x, null, 2)
	));
}

function scrollToChild(child){
	window.parent = child.parentNode;
	const parentWindowMin = parent.scrollLeft;
	const parentWindowMax = parent.scrollLeft + parent.clientWidth;
	const parentMaxScrollLeft = parent.scrollWidth - parent.clientWidth;

	const childMin = child.offsetLeft;
	const childMax = child.offsetLeft + child.clientWidth;
	const childCenter = (childMin + childMax)/2;
	const idealScrollLeft = childCenter - (parent.clientWidth/2);

	const idealScrollMin = childMax > parentWindowMin
		&& childMin < parentWindowMin
		? parent.scrollLeft - (parentWindowMin - childMin) - 20
		: undefined;

	const idealScrollMax = childMax > parentWindowMax
		&& childMin < parentWindowMax
		? parent.scrollLeft + (childMax - parentWindowMax) + 20
		: undefined;


	// console.log({
	// 	childMin, childMax, parentWindowMin, parentWindowMax, parentMaxScrollLeft
	// });


	if(childMin === 0){
		//parent.scrollLeft = 0;
		parent.scrollTo({
			top: 0,
			left: 0,
			behavior: 'smooth'
		});
		return;
	}

	if(childMax === parent.scrollWidth){
		//parent.scrollLeft = parentMaxScrollLeft;
		parent.scrollTo({
			top: 0,
			left: parentMaxScrollLeft,
			behavior: 'smooth'
		});
		return;
	}

	const childVisible = childMin >= parentWindowMin
		&& childMax <= parentWindowMax;

	if(childVisible) return;

	if(idealScrollMin){
		console.log({ idealScrollMin });
		parent.scrollTo({
			top: 0,
			left: idealScrollMin,
			behavior: 'smooth'
		});
		return;
	}

	if(idealScrollMax){
		console.log({ idealScrollMax });
		parent.scrollTo({
			top: 0,
			left: idealScrollMax,
			behavior: 'smooth'
		});
		return;
	}

	// console.log({
	// 	childCenter, idealScrollLeft, parentMaxScrollLeft
	// });

	if(idealScrollLeft <= 0){
		//parent.scrollLeft = 0;
		parent.scrollTo({
			top: 0,
			left: 0,
			behavior: 'smooth'
		});
		return;
	}
	if(idealScrollLeft <= parentMaxScrollLeft){
		//parent.scrollLeft = idealScrollLeft;
		parent.scrollTo({
			top: 0,
			left: idealScrollLeft,
			behavior: 'smooth'
		});
		return;
	}
	//parent.scrollLeft = parentMaxScrollLeft;
	parent.scrollTo({
		top: 0,
		left: parentMaxScrollLeft,
		behavior: 'smooth'
	});

	///window.child = child;
	//parent.scrollLeft = child.offsetLeft; // - child.clientWidth/2;
	// console.log({
	// 	left: parent.scrollLeft,
	// 	width: parent.clientWidth,
	// 	scroll: parent.scrollWidth
	// })
}

function getFileType(fileName=''){
	let type = 'default';
	const extension = ((
			fileName.match(/\.[0-9a-z]+$/i) || []
		)[0] ||''
	).replace(/^\./, '');

	//console.log(extension)
	if(ext[extension]){
		type=ext[extension];
	}
	return type;
}

const createTab = (parent) => (tabDef) => {
	const tab = document.createElement('div');
	tab.id = tabDef.id;
	tab.classList.add('tab');
	tab.classList.add('new');
	tabDef.changed && tab.classList.add('changed');

	const fileType = getFileType(tabDef.name);
	tab.innerHTML = `
		<span style="pointer-events: none;" class="icon-${fileType}">${tabDef.name}</span>
		<div class="tab-close"><div class="monaco-action-bar animated">
			<ul class="actions-container" role="toolbar" aria-label="Tab actions">
				<li class="action-item" role="presentation">
					<a class="action-label icon close-editor-action" role="button" title="Close">
					</a>
				</li>
			</ul>
		</div>
	`;
//	const oldScroll = parent.scrollLeft;
	parent.appendChild(tab);
	//parent.scrollLeft = oldScroll;
	//parent.scrollLeft = parent.scrollWidth;
	//setTimeout(() => scrollToChild(tab), 100);
	scrollToChild(tab)
	if(tabDef.active){
		setTimeout(() => {
			tab.classList.add('active');
			tab.classList.remove('new');
		}, 1)
	}

	const remainingTabs = Array.from(parent.querySelectorAll('.tab'));
	if(!remainingTabs.length){
		return;
	}
	if(remainingTabs.length === 1){
		remainingTabs[0].classList.add('last');
	} else {
		remainingTabs[0].classList.remove('last');
	}
};

const updateTab = (parent) => (tabDef) => {
	const child = parent.querySelector('#' + tabDef.id);
	if(!tabDef.active && child.classList.contains('active')){
		child.classList.remove('active');
	}
	if(tabDef.active && !child.classList.contains('active')){
		child.classList.add('active');
		scrollToChild(child);
	}
	if(tabDef.changed && !child.classList.contains('changed')){
		child.classList.add('changed');
		scrollToChild(child);
	}
};

const removeTab = (parent) => (tabDef) => {
	const child = parent.querySelector('#' + tabDef.id);
	child.parentNode.removeChild(child);

	const remainingTabs = Array.from(parent.querySelectorAll('.tab'));
	if(!remainingTabs.length){
		return;
	}
	if(remainingTabs.length <= 1){
		remainingTabs[0].classList.add('last');
	}
	//TODO: scroll parent to put newly active tab in view
};

// const removeTab = (parent) => (tabDef) => {
// 	//console.log(tabDef)
// 	if(tabDef.parentNode){
// 		tabDef.parentNode.removeChild(tabDef);
// 		return;
// 	}
// 	const child = parent.querySelector(tabDef.id);
// 	console.log(child)
// 	child && parent.removeChild(child)
// };

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

	tabsList = tabsList || tabsContainer.querySelector('#editor-tabs');

	attachListener(tabsContainer, {
		initTabs: initTabs(tabsList),
		createTab: createTab(tabsList),
		updateTab: updateTab(tabsList),
		removeTab: removeTab(tabsList)
	});

	//should not be doing this, rely on event instead!!!
	//tabsArray && initTabs(tabsList)(tabsArray);
	return tabsContainer;
}

export default EditorTabs;
