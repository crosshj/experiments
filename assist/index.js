const startLoad = performance.now();

import App from '../shared/modules/app.mjs';
import Editor from '../shared/modules/editor.mjs';
import Base64 from './modules/base64.mjs';
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

const opts = {
	title: 'assist'
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
				const notes = (new Array(300)).fill('code goes here').join('\n');
				Editor({ text: notes }, (error, editor) => {
					//TODO: error handle
					window.Editor = editor;
				});

				Base64();

				loadingEl.classList.add('hidden');
				setTimeout(() => {
					document.body.classList.remove('loading');
				}, 250);
			}, timeToDelay);
		});
	});
});
