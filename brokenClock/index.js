const startLoad = performance.now();

import App from '../shared/modules/app.mjs';
import Theme from '../shared/modules/theme.mjs';
import AppDom from '../shared/modules/appDom.mjs';
import Editor from './modules/inlineEditor.mjs';

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

			Editor();

			const loadingEl = document.querySelector('#loading-screen');
			setTimeout(() => {

				loadingEl.classList.add('hidden');
				setTimeout(() => {
					document.body.classList.remove('loading');
				}, 250);
			}, timeToDelay);
		});
	});
});
