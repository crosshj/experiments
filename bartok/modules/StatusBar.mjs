import { attachListeners } from './events/statusBar.mjs';

let bar;
function StatusBar(){
	if (bar) {
		return bar;
	}
	const statusBar = document.createElement('div');
	statusBar.id = "status-bar";
	statusBar.innerHTML = `
	<style>
		#status-bar {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 22px;
			font-size: 12px;
			padding: 2px 10px;
		}
		#status-bar .bg {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			background: #1f476b;
			background: #4f263d;
			background: rgb(var(--main-theme-highlight-color));
			filter: brightness(0.6);
		}
		#status-bar, #status-bar * {
			cursor: default;
		}
		#status-bar a {
			color: white;
			opacity: 0.65;
		}
		.statusbar-item.right a {
			margin-left: 10px;
		}
		#status-bar .editor-status-mode {
			text-transform: capitalize;
		}
		#status-bar .editor-status-mode.uppercase {
			text-transform: uppercase !important;
		}
	</style>

	<div class="bg"></div>

	<div class="statusbar-item statusbar-entry left" statusbar-entry-priority="10000" statusbar-entry-alignment="0">
		<a title="">bartok v0.4</a>
	</div>

	<div class="statusbar-item right">
	 <div class="editor-statusbar-item">
		 <a class="editor-status-selection" title="Go to Line" style="">
			 Ln <span class="line-number">--</span>,
			 Col <span class="column-number">--</span>
		</a>
		 <a class="editor-status-indentation hidden" title="Select Indentation" style="">
			Tab Size: <span class="tab-size">2</span>
		</a>
		 <a class="editor-status-encoding hidden" title="Select Encoding" style="">UTF-8</a>
		 <a class="editor-status-eol hidden" title="Select End of Line Sequence" style="">LF</a>
		 <a class="editor-status-mode" title="Select Language Mode" style="">--</a>
		</div>
	</div>
	`;

	function setLineNumber(number){
		const el = statusBar.querySelector('.editor-status-selection .line-number');
		el.innerHTML = number;
	}
	function setColNumber(number){
		const el = statusBar.querySelector('.editor-status-selection .column-number');
		el.innerHTML = number;
	}
	function setTabSize(number){
		const el = statusBar.querySelector('.editor-status-indentation .tab-size');
		el.innerHTML = number;
	}
	function setDocType(type){
		const el = statusBar.querySelector('.editor-status-mode');
		el.classList.remove('uppercase');
		let docType = type;
		if(type.json){
			docType = 'json';
		}
		if(type.typescript){
			docType = 'TypeScript';
		}
		if(type.assemblyscript){
			docType = 'AssemblyScript';
		}
		if(type.name && type.name.includes('html')){
			docType = 'html';
		}
		if(type === 'wat'){
			docType = 'WebAssembly'
		}
		if(type === 'piskel'){
			docType = 'Piskel'
		}
		if(type === 'default'){
			docType = 'Plain Text'
		}
		if(type === 'javascript'){
			docType = 'JavaScript'
		}
		while(docType.toString().includes('object')){
			if(docType.name){
				docType = docType.name;
				continue;
			}
			docType = 'Plain Text';
		}

		const capThese = ['css', 'html', 'json', 'xml', 'jsx', 'php', 'sql'];
		if(docType.toLowerCase && capThese.includes(docType.toLowerCase())){
			el.classList.add('uppercase');
		}

		el.innerHTML = docType;
	}
	attachListeners({ setLineNumber, setColNumber, setTabSize, setDocType });

	document.body.appendChild(statusBar);
}
export default StatusBar;