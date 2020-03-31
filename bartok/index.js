const startLoad = performance.now();

import App from '../shared/modules/app.mjs';
import Theme from '../shared/modules/theme.mjs';
import AppDom from '../shared/modules/appDom.mjs';
import Bartok from './modules/Bartok.mjs';

const appendStyleSheet = (url, callback) => {
	var style = document.createElement('link');
	style.rel = "stylesheet";
	style.crossOrigin = "anonymous";
	style.onload = callback;
	style.href = url;
	document.head.appendChild(style);
};

window.Theme = Theme({});
window.FUN = false;  // no terminal MOTD

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
			setTimeout(async () => {
				loadingEl.classList.add('hidden');
				await Bartok();
				document.body.classList.remove('loading');
			}, timeToDelay);
		});
	});
});
