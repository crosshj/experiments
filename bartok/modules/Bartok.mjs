import Editor from './Editor.mjs';
import TreeView from './TreeView.mjs';
import Terminal from './Terminal.mjs';

import ActionBar from './ActionBar.mjs';
import Services from './Services.mjs';
import HotKeys from './HotKeys.mjs';
import Panes from './PanesNew.mjs';

import { externalStateRequest } from './ExternalState.mjs';

import Operations from './operations.mjs';
import {
	getCodeFromService, getCurrentFile, getCurrentService
} from './state.mjs';
import { managementOp } from './management.mjs';

async function Bartok(){
	Panes();
	ActionBar();
	HotKeys();
	Services();
	Terminal();

	const {
		inlineEditor, List
	} = Editor({ getCodeFromService, TreeView });

	await Operations({
		getCodeFromService, managementOp, externalStateRequest,
		getCurrentFile, getCurrentService,
		inlineEditor, List  // instead of passing these here, Editor should be listening
	});
}

export default Bartok;
