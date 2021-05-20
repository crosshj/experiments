//show-preview
/*
	Expression Engine (EE) is the part that acts like a custom language and VM
		- it should handle registering custom commands
		- it should handle async behavior

	Umvelt should be an environment which registers its own language and nodes
		- TODO: detach the Umvelt part from the EE part
*/

import { ExpressionEngine } from './expressionEngine.js';
import { STYLE,DIV,PRE,tabTrim } from '../helpers/test-utils.js';

//TODO: should be sending mapped value to 2, instead mapped doesn't get populated
//TODO: message should be ack'ed before next instruction will execute

const exampleExpression = tabTrim(`
	fetch(url, "result")
	map(mapper, result, "mapped")
	send(mapped, 2)
	send(mapped, 1)
`);

const emitStep = setup(exampleExpression);
const engine = new ExpressionEngine({ emitStep });
const myFunc = engine(exampleExpression);

//https://github.com/toddmotto/public-apis << COOL
const apis = {
	ghibli: 'https://ghibliapi.herokuapp.com/films/?limit=10',
	bored: 'https://www.boredapi.com/api/activity/',
	countRegister: 'https://api.countapi.xyz/hit/boxesandwires/visits',
	countGet: 'https://api.countapi.xyz/get/boxesandwires/visits',
	cheerlights: 'https://api.thingspeak.com/channels/1417/field/1/last.json'
};
const api = 'ghibli';

const myFuncArgs = {
	url: apis[api],
	mapper: (args) => {
		if(Array.isArray) return args.map(x => x.title);
		const { value, activity, field1 } = args;
		return value || activity || field1;
	},
};

myFunc(myFuncArgs);

function attachStyle(){ STYLE(`
:root {
	--purple: #432e54;
	--green: #385038;
	--orange: #4b3c22;
	--blue: #214a6d;
	--grey: #333a;
}
body {
	font-family: sans-serif;
	color: #aaa;
	margin: 3em 1em;
}
pre { padding: .75em 1em; }

.step { display: flex; }
.step > div {
	padding: .4em;
	display: flex;
	justify-content: center;
	align-items: center;
}
.step > div, pre { background: var(--grey) }
.step + .step { margin-top: .5em; }

.op { width: 3em }
.op.start { background: var(--green); }
.op.fetch { background: var(--purple); }
.op.map { background: var(--orange) }
.op.send { background: var(--blue) }
.fetch + .fetch,
.map + .map,
.send + .send { margin: 0; }

.result { font-family: monospace; white-space: pre; }
`);
}

function setup(exampleExpression){
	attachStyle();

	PRE(exampleExpression)

	const emitStep = (step) => {
		console.log(step);
		const {name, status, result} = step;
		const _result = result?.result
			? JSON.stringify(result.result, null, 2)
			: '';
		const stepDiv = DIV(`
			<div class="${name} op">${name}</div>
			<div class="">${status||''}</div>
			<div class="result">${_result}</div>
		`);
		stepDiv.className = `step ${name}`;
	};
	return emitStep;
}
