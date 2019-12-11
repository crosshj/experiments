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

			const loadingEl = document.querySelector('#loading-screen');
			setTimeout(() => {
				window.Sketch = Sketch();

				loadingEl.classList.add('hidden');
				document.body.classList.remove('loading');
			}, timeToDelay);
		});
	});
});
