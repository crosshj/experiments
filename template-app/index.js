const startLoad = performance.now();

import App from '../shared/modules/app.mjs';
import Editor from '../shared/modules/editor.mjs';
import './modules/notes.mjs';
import './modules/lorum.mjs';
import theme from '../shared/modules/theme.mjs';

const appendStyleSheet = (url, callback) => {
	var style = document.createElement('link');
	style.rel = "stylesheet";
	style.crossOrigin = "anonymous";
	style.onload = callback;
	style.href = url;
	document.head.appendChild(style);
};

App((err, app) => {
	window.App = app;
	appendStyleSheet("./index.css", () => {
		const doneLoad = performance.now();
		const totalTime = doneLoad - startLoad;
		var timeToDelay = 1000;
		timeToDelay = (totalTime < timeToDelay)
			? timeToDelay - totalTime
			: 0;

		const loadingEl = document.querySelector('#loading-screen');
		setTimeout(() => {
			loadingEl.classList.add('hidden');
		}, timeToDelay);
	});
});

const notes = (new Array(300)).fill('code goes here').join('\n');
Editor({ text: notes }, (error, editor) => {
	//TODO: error handle
	window.Editor = editor;
});

theme && theme({
	mainColor: document.querySelector('meta[name="theme-color"]').content
});
