//const startLoad = performance.now();

import Theme from '../shared/modules/theme.mjs';

import LoaderBar from './modules/LoaderBar.mjs';
import Panes from './modules/PanesNew.mjs';
import Editor from './modules/Editor.mjs';

import ContextMenu from './modules/ContextMenu.mjs';
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

	ContextMenu();
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

	//NOTE: this is only temporary
	window.btBackup = () => {
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		const backupCounts = {};
		const getDayStr = x => `${x.getYear()}-${x.getMonth()}-${x.getDate()}`;
		const daysDiff = (a, b) => Math.abs(Math.round(
			(b-a)/(1000*60*60*24)
		));

		const removeStorage = (x) => {
			console.log(`removing ${new Date(
				Number(x.split('-')[1])
			)}`);
			localStorage.removeItem(x);
			return false;
		};

		const currentBackups = Object.keys(localStorage)
			.filter(x => x.includes('localServices-'))
			.sort().reverse();

		currentBackups
			.forEach(x => {
				const thisUnixDay = Number(x.split('-')[1]);
				const thisDate = new Date(thisUnixDay);
				const thisDateStr = getDayStr(thisDate);

				// remove older than 10 days ago
				if(daysDiff(today, thisDate) > 10){ return removeStorage(x); }

				// keep as many backups as current day has
				if(getDayStr(today) === thisDateStr){ return true; }

				// keep 3 backups from yesterday
				if(getDayStr(yesterday) === thisDateStr){
					backupCounts.yesterday = backupCounts.yesterday || 0;
					if(backupCounts.yesterday > 2){ return removeStorage(x); }
					backupCounts.yesterday++;
					return true;
				}

				// keep 1 backup from past days
				if(backupCounts[thisDateStr]){ return removeStorage(x); }
				backupCounts[thisDateStr] = 1;

				return true;
			});

		console.log(currentBackups.map(x => new Date(
			Number( x.split('-')[1] )
		)));

		let result, error;
		try {
			const currentServices = localStorage.getItem('localServices');
			const tag = new Date().valueOf();
			localStorage.setItem('localServices-'+tag, currentServices);
			result = `backed up all services: ${'localServices-'+tag}`
		} catch(e){ error = e; }
		return result || error;
	};

	const loadingEl = document.querySelector('#loading-screen');
	loadingEl.classList.add('dismissed');
	document.body.classList.remove('loading');

})();