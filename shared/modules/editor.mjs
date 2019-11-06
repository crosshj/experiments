import CodeMirror from "https://dev.jspm.io/codemirror@5.49.0/lib/codemirror.js";
// import "https://dev.jspm.io/codemirror@5.49.0/mode/javascript/javascript.js";
// import "https://dev.jspm.io/codemirror@5.49.0/mode/markdown/markdown.js";

/*
  <script src="https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/codemirror@5.49.0/mode/javascript/javascript.js"></script>

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/codemirror@5.49.0/theme/bespin.css">
*/

const appendScript = (url, callback) => {
	var materializeScript = document.createElement('script');
	materializeScript.crossOrigin = "anonymous";
	materializeScript.onload = callback;
	materializeScript.src = url;
	document.head.appendChild(materializeScript);
};

const codeMirrorJs = (callback) => {
	const url = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.js";
	appendScript(url, callback);
};

const codeMirrorJavascriptModeJs = (callback) => {
	const url = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/mode/javascript/javascript.js";
	appendScript(url, callback);
};

const setupEditor = ({ text }) => {
	const editor = CodeMirror.fromTextArea(document.querySelector('.simulation .functionInput'), {
		lineNumbers: true,
		mode: "markdown",
		//theme: 'bespin',
		styleActiveLine: true,
		matchBrackets: true
	});

	CodeMirror.keyMap.default["Shift-Tab"] = "indentLess";
	CodeMirror.keyMap.default["Tab"] = "indentMore";

	editor.getDoc().setValue(text);
	return editor;
};

const allTheEditorThings = ({ text }, callback) => {
	codeMirrorJs(() => {
		codeMirrorJavascriptModeJs(() => {
			const theEditor = setupEditor({ text });
			callback(null, theEditor);
		});
	});
}

export default allTheEditorThings;
