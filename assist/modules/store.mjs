import { readMetadata, logout, login } from '../store/auth.js';
import { getBM, updateBM } from '../store/xbs.js';

import handlebars from "https://unpkg.com/@fiug/handlebars-esm@4.7.7";
const template = await handlebars.compile({
	path: new URL(import.meta.url).href + '/../store.hbs'
});

let password;
let syncId;

window.logout = logout;
window.login = login;
window.updateBM = async () => {
	//TODO: set render to loading
	const data = [{
		"title": "Hacker News",
		"url": "https://news.ycombinator.com/",
		"description": "desc",
		"id": 1
	}];
	await updateBM({ data, password, syncId });
	//TODO: refresh render
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
	const authRes = await readMetadata();
	({ password, syncId } = authRes || {});
	const marks = password && syncId
		? await getBM(syncId, password)
		: undefined;
	render({ authRes, marks });
};

export default storeModule;