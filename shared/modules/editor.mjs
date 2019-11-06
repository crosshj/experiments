import CodeMirror from "https://dev.jspm.io/codemirror@5.49.0/lib/codemirror.js";
import "https://dev.jspm.io/codemirror@5.49.0/mode/javascript/javascript.js";
import "https://dev.jspm.io/codemirror@5.49.0/mode/markdown/markdown.js";

const notes = (new Array(300)).fill('code goes here').join('\n');

const setupEditor = () => {
	const editor = CodeMirror.fromTextArea(document.querySelector('.simulation .functionInput'), {
		lineNumbers: true,
		mode: "markdown",
		//theme: 'bespin',
		styleActiveLine: true,
		matchBrackets: true
	});

	CodeMirror.keyMap.default["Shift-Tab"] = "indentLess";
	CodeMirror.keyMap.default["Tab"] = "indentMore";

	editor.getDoc().setValue(notes);
	return editor;
};

export default setupEditor();
