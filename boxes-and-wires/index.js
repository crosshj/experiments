import State from './state/state.js';
import * as ExpressionEngine from './engine/expressionEngine.js';
import Config from './state/config.js';
const { boxes, wires } = Config;

import Wires from './user-interface/wires.js';
import SVG from './user-interface/svg.js';

(async () => {
	const Environ = Wires({ State, ExpressionEngine });
	Environ(SVG(), boxes, wires);

	// engine
	// state
	// config
	// wires (ui)
})();