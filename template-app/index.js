


const editor = CodeMirror.fromTextArea(document.querySelector('.simulation .functionInput'), {
	lineNumbers: true,
  mode:  "javascript",
	//theme: 'bespin',
	styleActiveLine: true,
	matchBrackets: true
});

CodeMirror.keyMap.default["Shift-Tab"] = "indentLess";
CodeMirror.keyMap.default["Tab"] = "indentMore";

editor.getDoc().setValue((new Array(300)).fill('code goes here').join('\n'));


Split({
	rowCursor: 'ns-resize',
  rowGutters: [{
    track: 2,
    element: document.querySelector('.gutter-footer'),
	}],
	onDragStart: () => {
		document.documentElement.classList.add("ns-draggable-cursor");
	},
	onDragEnd: () => {
		document.documentElement.classList.remove("ns-draggable-cursor");
	}
});

function setupSideNav(){
	var elems = document.querySelectorAll('.sidenav');
	var options = {};
	var instances = M.Sidenav.init(elems, options);
}
setupSideNav();
