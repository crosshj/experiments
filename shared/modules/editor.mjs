//import CodeMirror from "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.js";
//import "https://dev.jspm.io/codemirror@5.49.0/mode/javascript/javascript.js";
//import "https://dev.jspm.io/codemirror@5.49.0/mode/markdown/markdown.js";

// const codeMirrorCssUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.css";
// const codeMirrorBespinThemeCssUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/theme/bespin.css";
// const codeMirrorJsUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.js";
// const codeMirrorJsSyntaxUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/mode/javascript/javascript.js";

const codeMirrorCssUrl = "../shared/css/codemirror.css";
const codeMirrorBespinThemeCssUrl = "../shared/css/bespin.css";
const cmVSCodeUrl = "../shared/css/vscode.codemirror.css";

const codeMirrorJsUrl = "../shared/vendor/codemirror.js";
const codeMirrorScrollPastUrl = "../shared/vendor/codemirror-scrollpastend.js";
const codeMirrorShowInvisibles = "../shared/vendor/codemirror-show-invisibles.js"
const codeMirrorSearchCursor = "../shared/vendor/codemirror-searchcursor.js";

const codeMirrorJsSyntaxUrl = "../shared/vendor/codemirror/mode/javascript.js";

const appendScript = (url, callback) => {
	var script = document.createElement('script');
	script.crossOrigin = "anonymous";
	script.onload = callback;
	script.src = url;
	document.head.appendChild(script);
	return script;
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
	appendScript(codeMirrorJsUrl, () => {
		appendScript(codeMirrorSearchCursor, () => {
			appendScript(codeMirrorScrollPastUrl, () => {
				appendScript(codeMirrorShowInvisibles, callback);
			});
		});
	});
};

const codeMirrorModeJs = (mode, callback) => {
	if(mode === "default"){
		callback();
		return;
	}
	const scriptId = `cm-syntax-${mode}`;
	const scriptExists = !!document.getElementById(scriptId);
	if(scriptExists){
		callback();
		return;
	}
	const modeUrl = codeMirrorJsSyntaxUrl.replace('javascript', mode);
	const script = appendScript(modeUrl, callback);
	script.id = scriptId;
};

const setupEditor = (text, opts) => {
	const darkEnabled = window.localStorage.getItem('themeDark') === "true";
	const defaultOptions = {
		lineNumbers: true,
		mode: opts.mode,
		theme: darkEnabled ? "vscode-dark" : "",
		styleActiveLine: true,
		matchBrackets: true
	};
	const options = { ...defaultOptions, ...opts };

	//console.log({ mimeModes: CodeMirror.mimeModes, modes: CodeMirror.modes })
	const editor = CodeMirror.fromTextArea(document.querySelector('.simulation .functionInput'), options);

	//console.log({ options });
	CodeMirror.keyMap.default["Shift-Tab"] = "indentLess";
	CodeMirror.keyMap.default["Tab"] = "indentMore";

	editor.getDoc().setValue(text);
	return editor;
};


const allTheEditorThings = ({ text='', ...opts } = {}, callback) => {
	if(window.Editor){
		let mode = opts.mode || "javascript";
		try {
			mode = opts.mode.name || mode;
		} catch(e){}
		codeMirrorModeJs(mode, () => {
			opts.mode = opts.mode.mimeType || opts.mode || mode;
			window.Editor.toTextArea();
			const theEditor = setupEditor(text, opts || {});
			//theEditor.setOption("mode", mode);
			//theEditor.setOption("theme", "default");
			window.Editor = theEditor;
			callback(null, theEditor);
		})
		return;
	}
	codeMirrorCss(() => {
		codeMirrorJs(() => {
			codeMirrorModeJs("css", () => {
				codeMirrorModeJs("clike", () => {
					codeMirrorModeJs("xml", () => {
						codeMirrorModeJs(opts.mode, () => {
							const theEditor = setupEditor(text, opts || {});
							//theEditor.setOption("mode", opts.mode);
							//theEditor.setOption("theme", "default");
							window.Editor = theEditor;
							callback(null, theEditor);
						});
					});
				});
			});
		});
	});
}

export default allTheEditorThings;
