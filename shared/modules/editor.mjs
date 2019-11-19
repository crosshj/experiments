//import CodeMirror from "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.js";
//import "https://dev.jspm.io/codemirror@5.49.0/mode/javascript/javascript.js";
//import "https://dev.jspm.io/codemirror@5.49.0/mode/markdown/markdown.js";

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

const setupEditor = (text, opts) => {
	const darkEnabled = window.localStorage.getItem('themeDark') === "true";
	const defaultOptions = {
		lineNumbers: true,
		mode: "markdown",
		theme: darkEnabled ? "bespin" : "",
		styleActiveLine: true,
		matchBrackets: true
	};
	const options = { ...defaultOptions, ...opts };
	const editor = CodeMirror.fromTextArea(document.querySelector('.simulation .functionInput'), options);
	//console.log({ options });
	CodeMirror.keyMap.default["Shift-Tab"] = "indentLess";
	CodeMirror.keyMap.default["Tab"] = "indentMore";

	editor.getDoc().setValue(text);
	return editor;
};

const allTheEditorThings = ({ text='', ...opts } = {}, callback) => {
	codeMirrorCss(() => {
		codeMirrorJs(() => {
			codeMirrorJavascriptModeJs(() => {
				const theEditor = setupEditor(text, opts || {});
				theEditor.setOption("mode", opts.mode);
				callback(null, theEditor);
			});
		});
	});
}

export default allTheEditorThings;
