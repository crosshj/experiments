/*
	Expression Engine (EE) is the part that acts like a custom language and VM
		- it should handle registering custom commands
		- it should handle async behavior

	Umvelt should be an environment which registers its own language and nodes
		- TODO: detach the Umvelt part from the EE part
*/

import { ExpressionEngine } from './expressionEngine.js';
import { STYLE,DIV,PRE,tabTrim } from '../helpers/test-utils.js';

//https://github.com/toddmotto/public-apis << COOL
const apis = {
	ghibli: 'https://ghibliapi.herokuapp.com/films/?limit=10',
	//bored: 'https://www.boredapi.com/api/activity/',
	countRegister: 'https://api.countapi.xyz/hit/boxesandwires/visits',
	countGet: 'https://api.countapi.xyz/get/boxesandwires/visits',
	cheerlights: 'https://api.thingspeak.com/channels/1417/field/1/last.json'
};
const api = 'cheerlights';

const myFuncArgs = {
	url: apis[api],
	mapper: (args) => {
		if(Array.isArray(args)) return args.map(x => x.title);
		const { value, activity, field1 } = args;
		return value || activity || field1;
	},
};

function setup(exampleExpression, done){
	PRE(exampleExpression)

	const emitStep = (step) => {
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
		
		if(name === 'end') done();
	};
	return emitStep;
}

const exampleExpression = tabTrim(`
	fetch(url, "result")
	map(mapper, result, "mapped")
	send(mapped, 2)
	send(mapped, 1)
`);

export default async () => {
	PRE(`EXPRESSION ENGINE:`);
	PRE(`
	TODO:
		send mapped value to 2, instead mapped doesn't get populated
		message should be ack'ed before next instruction will execute
	`.trim());

	let testsResolve;
	const testsDone = new Promise((resolve) => testsResolve = resolve);

	const emitStep = setup(exampleExpression, testsResolve);
	const engine = new ExpressionEngine({ emitStep });
	const myFunc = engine(exampleExpression);

	myFunc(myFuncArgs);
	await testsDone;
};