import CodeMirror from "https://dev.jspm.io/codemirror@5.49.0/lib/codemirror.js";
// import "https://dev.jspm.io/codemirror@5.49.0/mode/javascript/javascript.js";
// import "https://dev.jspm.io/codemirror@5.49.0/mode/markdown/markdown.js";

const appendScript = (url, callback) => {
	var materializeScript = document.createElement('script');
	materializeScript.crossOrigin = "anonymous";
	materializeScript.onload = callback;
	materializeScript.src = url;
	document.head.appendChild(materializeScript);
};

const appendStyleSheet = (url, callback) => {
	var style = document.createElement('link');
	style.rel = "stylesheet";
	style.crossOrigin = "anonymous";
	style.onload = callback;
	style.href = url;
	document.head.appendChild(style);
};

const codeMirrorCss = (callback) => {
	const codeMirrorCssUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.css";
	const codeMirrorThemeCssUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/theme/bespin.css";

	appendStyleSheet(codeMirrorCssUrl, () => {
		appendStyleSheet(codeMirrorThemeCssUrl, callback)
	});
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
	codeMirrorCss(() => {
		codeMirrorJs(() => {
			codeMirrorJavascriptModeJs(() => {
				const theEditor = setupEditor({ text });
				callback(null, theEditor);
			});
		});
	});
}

export default allTheEditorThings;
