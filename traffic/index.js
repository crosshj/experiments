const startLoad = performance.now();

import Sketch from './modules/sketch.mjs';
import App from '../shared/modules/app.mjs';
import AppDom from '../shared/modules/appDom.mjs';
import Theme from '../shared/modules/theme.mjs';


const appendStyleSheet = (url, callback) => {
	var style = document.createElement('link');
	style.rel = "stylesheet";
	style.crossOrigin = "anonymous";
	style.onload = callback;
	style.href = url;
	document.head.appendChild(style);
};

// import Editor from '../shared/modules/Editor';
// const editorText =
// `## current state:
// - basic project scaffolded, using sketch.js
// - some particle effects, but nothing like what is needed

// ## todo:
// - get some basic particle system set up and make sure it can do what's needed: collision, spawn points, etc
// - create roads generatively
// - add vehicle particles
// - explore some ideas about traffic

// ## resources:
// - https://news.ycombinator.com/item?id=6765029

// `;

window.Theme = Theme({});

const opts = {
	title: 'Traffic',
	menu: {
		"Actions": [{
				text: "Toggle Dark",
				onclick: "window.Theme.toggleDark()",
				icon: "settings_brightness"
			}, {
				text: "Open Fullscreen",
				onclick: "window.App.openFullscreen(event)",
				icon: "fullscreen"
			}, {
				text: "Exit Fullscreen",
				onclick: "window.App.closeFullscreen(event)",
				icon: "fullscreen_exit"
		}]
	}
};
AppDom.config(opts);
App.config(opts);

AppDom(() => {
	App((err, app) => {
		window.App = app;
		appendStyleSheet("./index.css", () => {
			const doneLoad = performance.now();
			const totalTime = doneLoad - startLoad;
			var timeToDelay = 800;
			timeToDelay = (totalTime < timeToDelay)
				? timeToDelay - totalTime
				: 0;

			/*
			Editor({ text: editorText }, (error, editor) => {
				//TODO: error handle
				window.Editor = editor;
			});
			*/

			const loadingEl = document.querySelector('#loading-screen');
			setTimeout(() => {
				window.Sketch = Sketch();

				loadingEl.classList.add('hidden');
				document.body.classList.remove('loading');
			}, timeToDelay);
		});
	});
});
