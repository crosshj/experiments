


const editor = CodeMirror.fromTextArea(document.querySelector('.simulation .functionInput'), {
	lineNumbers: false,
  mode:  "javascript",
	theme: 'bespin',
	styleActiveLine: true,
	matchBrackets: true
});

function imBroken(thisDay, thisMinute){
	const broken = true;
	if (broken) {
		return 59;
	}
	return thisMinute;
}

const imComment =
`/*
there are 1440 minutes in a day represented by 720 clock hand positions
edit the function below and the box below will tell you how often a day it is right
*/`;

editor.getDoc().setValue(imComment + '\n' + imBroken.toString())

// the line numbers to be "readonly"
var readOnlyLines = (
	new Array(imComment.split('\n').length + 1)
).fill().map((x, i) => i);

editor.on('beforeChange',function(cm, change) {
	//console.log(change);
	if ( ~readOnlyLines.indexOf(change.from.line) ) {
			change.cancel();
	}
});

function editorChange(){
	//const { from, to, text, origin } = cm;
	//console.log(arguments);

	const functionDef = 'function imBroken' + editor.getValue().split('function imBroken')[1];

	let brokenFunction;
	const resultElement = document.querySelector('.simulation .result');
	try {
		var fn = new Function("return " + functionDef)();
		fn(); //test the function
		brokenFunction = fn;
	} catch (e) {
		/* do nothing */
	}

	var clockIsRight = 0;
	if(!!brokenFunction){
		for(var thisDay = 1; thisDay <= 7; thisDay++){
			for(var thisMinute = 0; thisMinute < 1440; thisMinute++){
				var result = brokenFunction(thisDay, thisMinute);
				if(result >= 1440){
					result = result % 1440;
				}
				if(thisMinute > 720 && result === thisMinute-720){
					clockIsRight++;
					continue;
				}

				if(result === thisMinute){
					clockIsRight++;
				}
			}
		}
	}

	resultElement.innerHTML = (
		clockIsRight
			? clockIsRight / 7
			: undefined
	) || 0;
}
editor.on('change', editorChange);

editorChange();
