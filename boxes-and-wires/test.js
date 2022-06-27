import StateTest from './state/state.test.js';
import customFunctions from './engine/customFunctions.test.js';
import EngineTest from './engine/expressionEngine.test.js';
import UITest from './user-interface/ui.test.js';

/*
TODO:
use testing framework from crosshj/vermiculate
*/

// await StateTest();
// await customFunctions();
// await EngineTest();

await UITest();