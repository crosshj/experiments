
import Editor from '../../shared/modules/editor.mjs';

const imComment =
`/*
there are 1440 minutes in a day represented by 720 clock hand positions
edit the function below and the box below will tell you how often a day it is right
*/`;

// function imBroken(thisDay, thisMinute){
// 	const broken = true;
// 	if (broken) {
// 		return 59;
// 	}
// 	return thisMinute;
// }

// editor.getDoc().setValue(imComment + '\n' + imBroken.toString())

const imBrokenFuncStr =
`${imComment}

function imBroken(thisDay, thisMinute){
  // OMG! will never reach the later return statements!

  // the typical clock is broken/wrong like this?
  return thisMinute + 0.001;

  // this clock is always fast by some random amount
  return thisMinute + Math.random();

  // a clock that is sometimes fast and sometimes slow
  // if analog + transitioning fast/slow, will be right between minutes
  // if digital + transitioning fast/slow, no similar guarantee
  // either way, it's not predictibly wrong, so it's more wrong
  return thisMinute + Math.random() - 0.5;

  // a clock with minute hand stuck at 27, hour hand working
  return (thisMinute - 27) % 60
    ? false
    : thisMinute;
}
`;



const getEditorChange = (editor) => function editorChange(){
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

const inlineEditor = () =>
Editor({
    text: imBrokenFuncStr,
    lineNumbers: false,
    mode:  "javascript",
    //theme: 'bespin',
    styleActiveLine: true,
    matchBrackets: true
}, (error, editor) => {
    //TODO: error handle

    const editorChange = getEditorChange(editor);
    editor.on('change', editorChange);
    editor.getDoc().setValue(imBrokenFuncStr);

    // the line numbers to be "readonly"
    var readOnlyLines = (
        new Array(imComment.split('\n').length)
    ).fill().map((x, i) => i);

    editor.on('beforeChange',function(cm, change) {
        //console.log(change);
        if ( ~readOnlyLines.indexOf(change.from.line) ) {
                change.cancel();
        }
    });
    editorChange();
    window.Editor = editor;
});

export default inlineEditor;
