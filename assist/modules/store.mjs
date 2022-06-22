import { readMetadata, logout, login } from '../store/auth.js';
import { getBM, updateBM } from '../store/xbs.js';

import handlebars from "https://unpkg.com/@fiug/handlebars-esm@4.7.7";
const template = await handlebars.compile({
	path: new URL(import.meta.url).href + '/../store.hbs'
});

let authRes;
let password;
let syncId;

window.logout = logout;
window.login = login;
window.updateBM = async () => {
	loading();
	const data = [{
		"title": "Bookmarks",
		"children": [
			{
				"title": "Hacker News",
				"url": "https://news.ycombinator.com/",
				"description": "read tech news here",
				"id": 2
			},
			{
				"title": "How to inspect network traffic from Chrome extensions",
				"url": "https://stackoverflow.com/questions/50673373/how-to-inspect-network-traffic-from-chrome-extensions",
				"description": "I have a third party chrome extension which sends some requests to a website and gets some data.\nI want to analyse network traffic for those requests.\nI tried using Chrome debugger, but that did no...",
				"id": 3
			}
		],
		"id": 1
	}];
	const results = await updateBM({ data, password, syncId });
	const marks = await getBM(syncId, password);
	render({ authRes, marks });
};

const loading = () => {
	document.querySelectorAll('store-section')
		.forEach((el) => {
			el.innerHTML = "";
			el.classList.add('loading');
		});
};

const render = ({ authRes, marks }) => {
	document.querySelectorAll('store-section')
		.forEach((el) => {
			el.innerHTML = template({
				user: authRes,
				bookmarks: marks ? JSON.stringify(marks, null, 2) : ''
			});
			el.classList.remove('loading');
			setTimeout(() => el.classList.remove('transition'), 500);
		});
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