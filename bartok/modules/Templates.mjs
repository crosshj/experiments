

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
      margin: 20px;
      margin-top: 60px;
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
  </script>

	<script id="jsxScript" type="text/jsx">
	const React = window.React;
	const render = window.render;
	`;

	const jsxSecond = `
	render(<App />, document.body);
	</script>

	<script>
		const appendScript = (url, callback) => {
			var script = document.createElement('script');
			script.crossOrigin = "anonymous";
			script.onload = callback;
			script.src = url;
			document.head.appendChild(script);
		};
		setTimeout(() => {
			const babelUrl = "https://unpkg.com/@babel/standalone/babel.min.js";
			const babelAppendCallback = () => {
				var input = document.getElementById('jsxScript').innerText;
				var output = Babel.transform(input, { presets: ['es2015','react'] }).code;
				//console.log({ output });
				const babeledScript = document.createElement('script');
				babeledScript.id = 'jsxScriptBabeled';
				babeledScript.innerHTML = output;
				document.head.appendChild(babeledScript);
				//console.log('BABELFY!');
			};
			appendScript(babelUrl, babelAppendCallback)
		}, 1);
	</script>

  <body></body>
</html>
`;

function templateJSX(src){
	console.log('JSX TEMPLATE ACTIVATE');
	return `${jsxFirst}${src}${jsxSecond}`;
}

export {
	templateJSX
};