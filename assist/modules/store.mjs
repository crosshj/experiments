import { readMetadata, logout, login } from '../store/auth.js';
import { getBM, updateBM } from '../store/xbs.js';

import handlebars from "https://unpkg.com/@fiug/handlebars-esm@4.7.7-4";
const template = await handlebars.compile({
	path: new URL(import.meta.url).href + '/../store.hbs'
});

let authRes;
let password;
let syncId;

const notes = `

	- add bookmarks one at a time (not faked)
	- update bookmarks when changed (API)
	- debounce keystrokes updating bookmarks

`;

const defaultBookmarks = [{
	title: "Bookmarks",
	children: [
		{
			title: "Hacker News",
			url: "https://news.ycombinator.com/",
			description: "read tech news here",
			id: 2
		},
		{
			title: "How to inspect network traffic from Chrome extensions",
			url: "https://stackoverflow.com/questions/50673373/how-to-inspect-network-traffic-from-chrome-extensions",
			description: "I have a third party chrome extension which sends some requests to a website and gets some data.\nI want to analyze network traffic for those requests.",
			id: 3
		}
	],
	id: 1
}];

let bookmarksDom;
let bookmarksObserver;
const bookmarksMutateConfig = {
	childList: true, // observe direct children
	subtree: true, // and lower descendants too
	characterDataOldValue: true // pass old data to callback
};

function modelFromDom(element) {
	var o = {};
	const title = element.querySelector(':scope > .title');
	if(title){
		o.title = title.textContent;
	}
	if(title && title.tagName === "A"){
		o.url = title.href;
	}
	const description = element.querySelector(':scope > .description');
	if(description){
		o.description = description.textContent;
	}
	const id = element.querySelector(':scope > .id');
	if(id){
		o.id = Number(id.textContent);
	}
	const children = element.querySelector(':scope > .children');
	if(!children || !children.children) return o;

	o.children = [];
	for(const child of Array.from(children.children)){
		o.children.push(modelFromDom(child));
	}
	return o;
}

function bookmarksMutate(mutationRecords){
	const scraped = modelFromDom(bookmarksDom).children;
	console.log(scraped);
	//TODO
}

window.logout = logout;
window.login = login;
window.updateBM = async () => {
	loading();
	const data = defaultBookmarks;
	const results = await updateBM({ data, password, syncId });
	const marks = await getBM(syncId, password);
	render({ authRes, marks });
};

const loading = () => {
	const storeSection = document.querySelector('store-section');
	storeSection.innerHTML = "";
	storeSection.classList.add('loading');
};

const render = ({ authRes, marks }) => {
	const storeSection = document.querySelector('store-section');
	bookmarksObserver && bookmarksObserver.disconnect();

	const html = template({
		user: authRes,
		notes: notes.trim().split('-').map(x=>x.trim()).filter(x=>!!x),
		bookmarks: marks
	});
	storeSection.innerHTML = html;

	bookmarksDom = storeSection.querySelector('#bookmarks');
	if(bookmarksDom){
		bookmarksObserver = new MutationObserver(bookmarksMutate);
		bookmarksObserver.observe(bookmarksDom, bookmarksMutateConfig);
	}

	storeSection.classList.remove('loading');
	setTimeout(() => storeSection.classList.remove('transition'), 500);
};

async function storeModule(){
	(authRes = await readMetadata());
	({ password, syncId } = authRes || {});
	const marks = password && syncId
		? await getBM(syncId, password)
		: undefined;
	render({ authRes, marks });
};

export default storeModule;