import Editor from '../shared/modules/editor.mjs';
import Sketch from './modules/sketch.mjs';
import App from '../shared/modules/app.mjs';

App((err, app) => {
	window.App = app;
});

const text =
`## current state:
- basic project scaffolded, using sketch.js
- some particle effects, but nothing like what is needed

## todo:
- get some basic particle system set up and make sure it can do what's needed: collision, spawn points, etc
- create roads generatively
- add vehicle particles
- explore some ideas about traffic

## resources:
- https://news.ycombinator.com/item?id=6765029

`;
Editor({ text }, (error, editor) => {
	//TODO: error handle
	window.Editor = editor;
});

window.Sketch = Sketch;
