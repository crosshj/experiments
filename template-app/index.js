


const editor = CodeMirror.fromTextArea(document.querySelector('.simulation .functionInput'), {
	lineNumbers: true,
  mode:  "javascript",
	theme: 'bespin',
	styleActiveLine: true,
	matchBrackets: true
});

editor.getDoc().setValue((new Array(300)).fill('code goes here').join('\n'));


Split({
  rowGutters: [{
    track: 2,
    element: document.querySelector('.gutter-footer'),
  }]
})