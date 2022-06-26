import State from './state/state.js';
import * as ExpressionEngine from './engine/expressionEngine.js';
import Config from './state/config.js';
const { boxes, wires } = Config;

import Wires, { svg } from './user-interface/wires.js';

(async () => {
	const Environ = Wires({ State, ExpressionEngine });
	Environ(svg(), boxes, wires);

	// engine
	// state
	// config
	// wires (ui)
})();