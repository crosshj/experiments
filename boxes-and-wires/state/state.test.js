import { STYLE,DIV,PRE,tabTrim } from '../helpers/test-utils.js';
import State from './state.js';

const state = new State({ foo: 'bar' });
state.on('create', x => PRE('create: ' + JSON.stringify(x)));
state.on('update', x => PRE('update: ' + JSON.stringify(x)));
state.on('delete', x => PRE('delete: ' + JSON.stringify(x)));
state.on('history', x => PRE('history: ' + JSON.stringify(x)));

const test = async () => {
	PRE(`STATE:`);
	PRE('value: ' +
		JSON.stringify(state.toObject().foo, null, 2)
	);
	PRE('history: ' + 
		JSON.stringify(state.history(), null, 2)
	);
	return new Promise((resolve) => {
		setTimeout(() => {
			state.update({ foo: 'updated' })
			PRE('history: ' +
				JSON.stringify(state.history(), null, 2)
			);
			PRE('value: ' +
				JSON.stringify(state.toObject().foo, null, 2)
			);
			resolve();
		}, 1000);
	});
};

export default test;