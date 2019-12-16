const startLoad = performance.now();

import App from '../shared/modules/app.mjs';
import Editor from '../shared/modules/editor.mjs';
import Base64 from './modules/base64.mjs';
import Notes from './modules/notes.mjs';
import Theme from '../shared/modules/theme.mjs';
import AppDom from '../shared/modules/appDom.mjs';

const appendStyleSheet = (url, callback) => {
	var style = document.createElement('link');
	style.rel = "stylesheet";
	style.crossOrigin = "anonymous";
	style.onload = callback;
	style.href = url;
	document.head.appendChild(style);
};

window.Theme = Theme({});

window.switchTool = (name) => {
	localStorage.setItem('tool-choice', name);
	Array.from(document.querySelectorAll('.section-module'))
		.forEach(moduleEl => moduleEl.classList.add('hidden'));
	document.querySelector(`${name}-section`).classList.remove('hidden');
	//console.log(`Switch to ${name}`);
};

const opts = {
	title: 'Assistant',
	icon: './images/light.svg',
	menu: {
		"Tools": [{
			text: "Notes",
			onclick: "window.switchTool('notes')",
			icon: "create"
		}, {
			text: "Encode",
			onclick: "window.switchTool('base64')",
			icon: "lock"
		}],
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
		}],
	}
};
AppDom.config(opts);
App.config(opts);

AppDom((domErrors, appDom) => {
	App((err, app) => {
		app.dom = appDom;
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
				// const notes = (new Array(300)).fill('code goes here').join('\n');
				// Editor({ text: notes }, (error, editor) => {
				// 	//TODO: error handle
				// 	window.Editor = editor;
				// });

				const toolChoice = localStorage.getItem('tool-choice') || 'notes';
				window.switchTool(toolChoice);
				Base64();
				Notes();

				loadingEl.classList.add('hidden');
				setTimeout(() => {
					document.body.classList.remove('loading');
				}, 250);
			}, timeToDelay);
		});
	});
});
