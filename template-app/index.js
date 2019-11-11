const startLoad = performance.now();

import App from '../shared/modules/app.mjs';
import Editor from '../shared/modules/editor.mjs';
import Notes from './modules/notes.mjs';
import Lorum from './modules/lorum.mjs';
import theme from '../shared/modules/theme.mjs';
import AppDom from '../shared/modules/appDom.mjs';

const appendStyleSheet = (url, callback) => {
	var style = document.createElement('link');
	style.rel = "stylesheet";
	style.crossOrigin = "anonymous";
	style.onload = callback;
	style.href = url;
	document.head.appendChild(style);
};

theme && theme({
	mainColor: document.querySelector('meta[name="theme-color"]').content
});

const preferDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const darkEnabled = document.querySelector(":root").classList.contains("dark-enabled");
if(preferDarkMode && darkEnabled){
	document.body.style.backgroundColor = "#363238";
}

AppDom(() => {
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
				const notes = (new Array(300)).fill('code goes here').join('\n');
				Editor({ text: notes }, (error, editor) => {
					//TODO: error handle
					window.Editor = editor;
				});

				Notes();
				Lorum();

				loadingEl.classList.add('hidden');
				setTimeout(() => {
					document.body.classList.remove('loading');
				}, 250);
			}, timeToDelay);
		});
	});
});
