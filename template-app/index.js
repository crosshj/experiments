import '../shared/modules/notes.mjs';
import '../shared/modules/lorum.mjs';

import Editor from '../shared/modules/editor.mjs';
const notes = (new Array(300)).fill('code goes here').join('\n');
Editor({ text: notes }, (error, editor) => {
	//TODO: error handle
	window.Editor = editor;
});

import theme from '../shared/modules/theme.mjs';
theme && theme({
	mainColor: document.querySelector('meta[name="theme-color"]').content
});

import App from '../shared/modules/app.mjs';
App((err, app) => {
	window.App = app;
});
