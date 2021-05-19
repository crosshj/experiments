//show-preview
import { compile, engine } from './expressionEngine.js';


//TODO: not sure what to expect here just yet
console.log({compile, engine});

const compiled = compile(`
//expression
`, 'verbose');
console.log({ compiled });

const instance = new engine();
console.log({ instance });

