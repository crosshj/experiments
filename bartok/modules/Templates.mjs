

const jsxFirst = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>htm + preact</title>
    <meta name="description" content="Using rxjs with react in a fluxy (reduxy) and about-as-minimal-as-can-get kind of way">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="mobile-web-app-capable" content="yes">
  </head>

  <style>
    body {
      margin: 0px;
      margin-top: 40px;
      color: white;
      height: calc(100vh - 40px);
      overflow: hidden;
      color: #ccc;
      font-family: sans-serif;
    }
  </style>

  <script type="module">
    import {
      html, Component, render, useState, useCallback, h
    } from 'https://unpkg.com/htm/preact/standalone.module.js';
    window.Component = Component;
    window.render = render;
    window.useState = useState;
    window.useCallback = useCallback;
		window.React = { createElement: h, createClass: h };
		window.h = h;
  </script>

	<script id="jsxScript" type="text/jsx">
	const React = window.React;
	const Component = window.Component;
	const render = window.render;
	const h = window.h;
	window.createClass = window.h;
	window.createElement = window.h;

	//console.log(window.h);
	`;

	const jsxSecond = `
	render(<App />, document.body);
	</script>

	<script>
		const input = document.getElementById('jsxScript').innerText;
		const xfrmScript = document.createElement('script');
		xfrmScript.id = 'jsxScriptXfrm';

		const appendScript = (url, callback) => {
			var script = document.createElement('script');
			script.crossOrigin = "anonymous";
			script.onload = callback;
			script.src = url;
			document.head.appendChild(script);
		};

		const appendBabel = () => {
			const babelUrl = "https://unpkg.com/@babel/standalone/babel.min.js";
			const babelAppendCallback = () => {
				const output = Babel.transform(input, { presets: ['es2015','react'] }).code;
				//console.log('BABELFY!');
				//console.log({ output });
				xfrmScript.innerHTML = output;
				document.head.appendChild(xfrmScript);
			};
			appendScript(babelUrl, babelAppendCallback);
		};

		const appendHscript = () => {
			const hscriptUrl = "https://rawgit.com/NerdGGuy/html2hscript/master/browser.js"
			const hscriptAppendCallback = () => {
				hscript(input, function(err, output) {
					console.log('HSCRIPTFY!');
					console.log({ output });
					xfrmScript.innerHTML = output;
					document.head.appendChild(xfrmScript);
				});
			};
			appendScript(hscriptUrl, hscriptAppendCallback);
		};

		const appendPlain = () => {
			xfrmScript.innerHTML = input;
			document.head.appendChild(xfrmScript);
		};

		setTimeout(() => {
			appendBabel();

			// this will require hyperscript -> react code (and maybe more)
			// https://github.com/mlmorg/react-hyperscript
			//appendHscript();

			//appendPlain();
		}, 1);
	</script>

  <body></body>
</html>
`;

function templateJSX(src){
	//console.log('JSX TEMPLATE ACTIVATE');
	return `${jsxFirst}${src}${jsxSecond}`;
}

export {
	templateJSX
};