const startLoad = performance.now();

import Sketch from './modules/sketch.mjs';
import RoadMap from './modules/map.mjs';

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

const switchMap = {
	road: () => {
		window.Sketch && window.Sketch.start()
		window.Sketch = window.Sketch || Sketch();
	},
	map: () => {
		window.RoadMap && window.RoadMap.start()
		window.RoadMap = window.RoadMap || new RoadMap();
	}
};

window.switchTool = (name) => {
	localStorage.setItem('tool-choice', name);

	window.Sketch && window.Sketch.stop();
	window.RoadMap && window.RoadMap.stop();
	Array.from(document.querySelectorAll('.container.canvas'))
		.forEach(moduleEl => moduleEl.classList.add('hidden'));
	document.querySelector(`.container.canvas.${name}`)
		.classList.remove('hidden');

	switchMap[name]();
	console.log(`Switch to ${name}`);
};

window.Theme = Theme({});

const opts = {
	title: 'Traffic',
	menu: {
		"Modes": [{
				text: "Road",
				onclick: "switchTool('road')",
				icon: "directions_car"
			}, {
				text: "Map",
				onclick: "switchTool('map')",
				icon: "map"
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
			const toolChoice = localStorage.getItem('tool-choice') || 'road';
			window.switchTool(toolChoice);

			const loadingEl = document.querySelector('#loading-screen');
			setTimeout(() => {
				//window.Sketch = Sketch();

				loadingEl.classList.add('hidden');
				document.body.classList.remove('loading');
			}, timeToDelay);
		});
	});
});
