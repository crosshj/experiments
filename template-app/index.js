import App from '../shared/modules/app.mjs';
import Editor from '../shared/modules/editor.mjs';
import './modules/notes.mjs';
import './modules/lorum.mjs';
import theme from '../shared/modules/theme.mjs';

App((err, app) => {
	window.App = app;
});

const notes = (new Array(300)).fill('code goes here').join('\n');
Editor({ text: notes }, (error, editor) => {
	//TODO: error handle
	window.Editor = editor;
});

theme && theme({
	mainColor: document.querySelector('meta[name="theme-color"]').content
});
