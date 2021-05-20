//show-preview
import State from './state.js';

const state = new State(['foo', 'fee']);
state.on('create', console.log);
state.on('update', console.log);
state.on('delete', console.log);
state.on('history', console.log);

console.log(state.history())

setTimeout(() => {
	console.log(state.history())
	console.log(state.toObject())
}, 3000);
