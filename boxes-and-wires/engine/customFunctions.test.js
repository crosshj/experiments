//show-preview
import customFunctions, { getMappedItems } from './customFunctions.js';
import { STYLE,DIV,PRE,tabTrim } from '../helpers/test-utils.js';

STYLE(styles());

PRE(`
customFunctions seems to have state problems

TODO: see if we can be rid of:
	promises, reset, bindInput
	wrapCustomFunctions
	getMappedItems
`)

const emitStep = {};
const currentNode = {};
const fns = customFunctions(emitStep, currentNode)

PRE([
	'customFunctions:',
	...Object.keys(fns)
].join('\n\t'));

function styles(){
return `
	body {
		color: #ccc;
		margin: 3em 2em;
	}
	pre { white-space: pre-wrap; tab-size: 3; }
`;
}
