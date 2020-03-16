import Editor from '../../shared/modules/editor.mjs';

const inlineEditor = (text) => {
	const editorDiv = document.createElement('div');
	editorDiv.innerHTML = `
		<ul class="editor-controls">
			<li>create</li>
			<li>read</li>
			<li>update</li>
			<li>delete</li>
			<li>manage</li>
			<li>monitor</li>
			<li>persist</li>
		</ul>
		<textarea class="functionInput"></textarea>
	`;
	editorDiv.classList.add('section');
	editorDiv.classList.add('simulation');
	document.querySelector('.container')
		.appendChild(editorDiv);

	Editor({
			text,
			lineNumbers: true,
			mode:  "javascript",
			styleActiveLine: true,
			matchBrackets: true
	}, (error, editor) => {
			//editor.setOption("theme", "default");
			window.Editor = editor;
	});
}

async function bartok(){
	const readAfter = ({ result }) => {
		// console.log({ result });
		inlineEditor(result.result[0].code);
	};

	const operations = [{
			url: ''
		}, {
			url: 'service/create',
			config: {
				method: 'POST',
				name: 'test-service',
				body: {
					name: 'test-service'
				}
			}
		}, {
			url: 'service/read/1',
			after: readAfter
		}, {
			url: 'service/update',
			config: {
				method: 'POST',
				name: 'test-service'
			}
		}, {
			url: 'service/delete',
			config: {
				method: 'POST',
				name: 'test-service'
			}
		}, {
			url: 'manage'
		}, {
			url: 'monitor'
		}, {
			url: 'persist'
	}];

	operations.forEach(x => {
		x.url = `http://localhost:3080/${x.url}`;
		if(x.config && x.config.body){
			x.config.body = JSON.stringify(x.config.body);
		}
	});


	for(var i=0, len= operations.length; i<len; i++){
		const operation = operations[i];
		const response = await fetch(operation.url, operation.config);
		const result = await response.json();
		if(operation.after){
			operation.after({ result })
		}
		//console.log({ operation, data });
	}

}

export default bartok;
