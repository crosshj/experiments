//const startLoad = performance.now();

import Theme from '../shared/modules/theme.mjs';

import LoaderBar from './modules/LoaderBar.mjs';
import Panes from './modules/PanesNew.mjs';
import Editor from './modules/Editor.mjs';

import TreeView from './modules/TreeView.mjs';
import ActionBar from './modules/ActionBar.mjs';
import Terminal from './modules/Terminal.mjs';
import HotKeys from './modules/HotKeys.mjs';
import StatusBar from './modules/StatusBar.mjs';
import Services from './modules/Services.mjs';

import { list } from './modules/Listeners.mjs';

import { externalStateRequest } from './modules/ExternalState.mjs';
import Operations from './modules/operations.mjs';
import {
	getCodeFromService, getCurrentFile, getCurrentService,
	getCurrentFolder, setCurrentFolder,
	resetState
} from './modules/state.mjs';

import { managementOp } from './modules/management.mjs';


// const appendStyleSheet = (url, callback) => {
// 	var style = document.createElement('link');
// 	style.rel = "stylesheet";
// 	style.crossOrigin = "anonymous";
// 	style.onload = callback;
// 	style.href = url;
// 	document.head.appendChild(style);
// };

const appendScript = (url) => new Promise((resolve, reject) => {
	var newScript = document.createElement('script');
	newScript.crossOrigin = "anonymous";
	newScript.onload = () => {
		resolve();
	};
	newScript.src = url;
	document.head.appendChild(newScript);
});

(async () => {
	window.Theme = Theme({});
	//window.FUN = true;  // no terminal MOTD

	await appendScript("../shared/vendor/materialize.min.js");

	Panes();
	Terminal({ getCurrentService });
	LoaderBar();

	const {
		inlineEditor, List
	} = Editor({ getCodeFromService, TreeView });
	inlineEditor(); //cache resources

	TreeView();
	StatusBar();
	ActionBar();
	HotKeys();
	Services({ list });

	await Operations({
		getCodeFromService, managementOp, externalStateRequest,
		getCurrentFile, getCurrentService,
		getCurrentFolder, setCurrentFolder,
		resetState,
		inlineEditor, List  // instead of passing these here, Editor should be listening
	});

	const loadingEl = document.querySelector('#loading-screen');
	loadingEl.classList.add('dismissed');
	document.body.classList.remove('loading');

})();