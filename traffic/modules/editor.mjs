import CodeMirror from "https://dev.jspm.io/codemirror@5.49.0/lib/codemirror.js";
import "https://dev.jspm.io/codemirror@5.49.0/mode/javascript/javascript.js";
import "https://dev.jspm.io/codemirror@5.49.0/mode/markdown/markdown.js";

const setupEditor = () => {
	const editor = CodeMirror.fromTextArea(document.querySelector('.simulation .functionInput'), {
		lineNumbers: true,
		mode: "markdown",
		theme: 'bespin',
		styleActiveLine: true,
		matchBrackets: true
	});

	CodeMirror.keyMap.default["Shift-Tab"] = "indentLess";
	CodeMirror.keyMap.default["Tab"] = "indentMore";

	const notes =
`## current state:
- basic project scaffolded, using sketch.js
- some particle effects, but nothing like what is needed

## todo:
- get some basic particle system set up and make sure it can do what's needed: collision, spawn points, etc
- create roads generatively
- add vehicle particles
- explore some ideas about traffic

## resources:
- https://news.ycombinator.com/item?id=6765029

`;

	editor.getDoc().setValue(notes);
	return editor;
};

export default setupEditor();
