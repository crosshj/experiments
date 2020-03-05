const startLoad = performance.now();

import App from '../shared/modules/app.mjs';
import Pixi from './modules/pixi.mjs';
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
				Pixi();

				loadingEl.classList.add('hidden');
				setTimeout(() => {
					document.body.classList.remove('loading');
				}, 250);
			}, timeToDelay);
		});
	});
});
