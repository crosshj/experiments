//import CodeMirror from "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.js";
//import "https://dev.jspm.io/codemirror@5.49.0/mode/javascript/javascript.js";
//import "https://dev.jspm.io/codemirror@5.49.0/mode/markdown/markdown.js";

// const codeMirrorCssUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.css";
// const codeMirrorBespinThemeCssUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/theme/bespin.css";
// const codeMirrorJsUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.js";
// const codeMirrorJsSyntaxUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/mode/javascript/javascript.js";

const codeMirrorCssUrl = "/shared/css/codemirror.css";
const codeMirrorBespinThemeCssUrl = "/shared/css/bespin.css";
const cmVSCodeUrl = "/shared/css/vscode.codemirror.css";

const codeMirrorJsUrl = "/shared/vendor/codemirror.js";
const codeMirrorJsSyntaxUrl = "/shared/vendor/codemirror-javascript.js";

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
	appendStyleSheet(codeMirrorCssUrl, () => {
		appendStyleSheet(cmVSCodeUrl, () => {
			appendStyleSheet(codeMirrorBespinThemeCssUrl, callback)
		});
	});
};

const codeMirrorJs = (callback) => {
	appendScript(codeMirrorJsUrl, callback);
};

const codeMirrorJavascriptModeJs = (callback) => {
	appendScript(codeMirrorJsSyntaxUrl, callback);
};

const setupEditor = (text, opts) => {
	const darkEnabled = window.localStorage.getItem('themeDark') === "true";
	const defaultOptions = {
		lineNumbers: true,
		mode: "markdown",
		theme: darkEnabled ? "vscode-dark" : "",
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
	if(window.Editor){
		window.Editor.toTextArea();
		const theEditor = setupEditor(text, opts || {});
		opts.mode && theEditor.setOption("mode", opts.mode);
		theEditor.setOption("theme", "default");
		window.Editor = theEditor;
		callback(null, theEditor);
		return;
	}
	codeMirrorCss(() => {
		codeMirrorJs(() => {
			codeMirrorJavascriptModeJs(() => {
				const theEditor = setupEditor(text, opts || {});
				theEditor.setOption("mode", opts.mode);
				theEditor.setOption("theme", "default");
				window.Editor = theEditor;
				callback(null, theEditor);
			});
		});
	});
}

export default allTheEditorThings;
