//show-preview
import customFunctions, { getMappedItems } from './customFunctions.js';
import { STYLE,DIV,PRE,tabTrim } from '../helpers/test-utils.js';

PRE(`CUSTOM FUNCTIONS:`);
PRE(`
seems to have state problems

TODO:
	see if we can be rid of:
	- promises, reset, bindInput
	- wrapCustomFunctions
	- getMappedItems
`.trim())

const emitStep = {};
const currentNode = {};
const fns = customFunctions(emitStep, currentNode)

PRE([
	'customFunctions:',
	...Object.keys(fns)
].join('\n\t'));

