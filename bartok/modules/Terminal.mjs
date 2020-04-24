//import "https://cdn.jsdelivr.net/npm/xterm@4.4.0/lib/xterm.min.js";
//import "https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.3.0/lib/xterm-addon-fit.js";
import "../../shared/vendor/xterm.min.js";
import "../../shared/vendor/xterm-addon-fit.js";
import { debounce } from "../../shared/modules/utilities.mjs";

import motd from "./motd.mjs";
import { attachEvents, attachTrigger } from './events/terminal.mjs';
import { templateJSX, templateSVC3 } from './Templates.mjs';

let EventTrigger;

function tryExecCommand({ command, loading, done }){
		const [ op, ...args] = command.split(' ');
		let filename, newName, _id, name, other;
		let after, noDone;

		const manageOps = [
			"addFile", "renameFile", "deleteFile",
			"renameProject"
		];
		const projectOps = [
			"cancel", "create", "read", "update", "delete",
			"manage", "monitor", "persist",
			"fullscreen", "help"
		];

		const ops = [...manageOps, ...projectOps]

		const isManageOp = manageOps
			.map(x => x.toLowerCase())
			.includes(op.toLowerCase());
		const isProjectOp = projectOps
			.map(x => x.toLowerCase())
			.includes(op.toLowerCase());

		if(isManageOp){
			([ filename, newName ] = args);
		}
		if(isProjectOp){
			([ _id, name, ...other] = args);
		}
		let id = Number(_id);

		if(!isManageOp && !isProjectOp){
			done(`${command}:  command not found!\nSupported: ${ops.join(', ')}\n`);
			return;
		}

		if(['help'].includes(op)){
			done(`\nThese might work:\n\n\r   ${
				ops
					.filter(x => x !== "help")
					.join('\n\r   ')
			}\n`);
			return;
		}

		if(['fullscreen'].includes(op)){
			document.documentElement.requestFullscreen();
			return done();
		}

		const body = (id === 0 || !!id)
			? { id }
			: {
				name: name || (document.body.querySelector('#service_name')||{}).value,
				id: id || (document.body.querySelector('#service_id')||{}).value,
				code: (window.Editor||{ getValue: ()=>{}}).getValue()
			}

		if(['read'].includes(op)){
			body.id = id;
			delete body.name;
			delete body.code;
			if(!id || id === NaN){
				body.id = "*";
				after = ({ result }) => {
					loading('DONE');
					loading(`\n
					${result.result.map(x => `${x.id.toString().padStart(5, ' ')}   ${x.name}`).join('\n')}
					\n`.replace(/\t/g, ''));
					done();
				};
				noDone = () => {}
			}
		}

		if(['create'].includes(op)){
			body.id = Number(id);
			body.name = name;
			body.code = (window.Editor||{ getValue: ()=>{}}).getValue()
		}

		const event = new CustomEvent('operations', {
			bubbles: true,
			detail: {
				operation: op,
				listener: Math.random().toString().replace('0.', ''),
				filename, newName,
				done: noDone || done,
				after,
				body
			}
		});
		document.body.dispatchEvent(event);

		//TODO: listen for when it's done
		isProjectOp && loading(`${command}: running... `);
	};

function _Terminal({ getCurrentService }){
	const options = {
		theme: {
			foreground: '#ccc', // '#ffffff',
			//background: '#000',
			background: 'rgba(255, 255, 255, 0.0)', // '#1e1e1e',
			cursor: '#ffffff',
			selection: 'rgba(255, 255, 255, 0.3)',
			black: '#000000',
			red: '#e06c75',
			brightRed: '#e06c75',
			green: '#A4EFA1',
			brightGreen: '#A4EFA1',
			brightYellow: '#EDDC96',
			yellow: '#EDDC96',
			magenta: '#e39ef7',
			brightMagenta: '#e39ef7',
			cyan: '#5fcbd8',
			brightBlue: '#5fcbd8',
			brightCyan: '#5fcbd8',
			blue: '#5fcbd8',
			white: '#b0b0b0',
			brightBlack: '#808080',
			brightWhite: '#ffffff'
		},
		allowTransparency: true,
		fontSize: 13,
		fontWeight: 100,
		convertEol: true
	};

	const term = new Terminal(options);

	const fitAddon = new (FitAddon.FitAddon)();
	term.loadAddon(fitAddon);

	//console.log({ term, Terminal });
	const termContainer = document.createElement('div');
	termContainer.classList.add('term-contain');

	const selected = localStorage.getItem('rightPaneSelected') || "terminal";

	const pvActive = [];
	const pvControlsClass = (type) => `
		${type}-action
		preview-control
		${selected==="preview" ? "" : "hidden"}
		${pvActive.includes(type) ? "checked" : ""}
	`.split('\n').filter(x => !!x).join('');

	const termMenu = document.createElement('div');
	termMenu.id = "terminal-menu";
	termMenu.innerHTML = `
	<style>
		#terminal-menu > div:nth-child(2) ul li {
			padding-left: 15px;
		}
		#terminal-menu li.action-item:hover a.action-label {
			filter: none;
			color: rgb(231, 231, 231);
		}
		#terminal-menu li.action-item.checked a {
			color: rgb(231, 231, 231);
			border-bottom-color: rgba(128, 128, 128, 0.8);
		}
		#terminal-menu .terminal-actions li.action-item.checked a {
			border-bottom: 0;
		}
		li.action-item.preview-control.checked a.lock-panel-action {
			filter: brightness(.55) sepia(1) contrast(5);
		}
	</style>
	<div class="composite-bar panel-switcher-container">
		 <div class="monaco-action-bar">
				<ul class="actions-container view-switcher" role="toolbar" aria-label="Active View Switcher">
					 <li class="action-item ${selected==="terminal" ? "checked" : ""}" role="tab" draggable="true" active>
							<a class="action-label terminal" data-type="terminal">Terminal</a>
					 </li>
					 <li class="action-item ${selected==="preview" ? "checked" : ""}" role="tab" draggable="true">
							<a class="action-label preview" data-type="preview">Preview</a>
						</li>
						<li class="action-item ${selected==="logs" ? "checked" : ""}" role="tab" draggable="true">
							<a class="action-label logs" data-type="logs">Logs</a>
						</li>
					 <li class="action-item" role="button" aria-label="Additional Views" title="Additional Views">
							<a class="action-label toggle-more" aria-label="Additional Views" title="Additional Views" style="background-color: rgb(30, 30, 30);"></a>
							<div class="badge" aria-hidden="true" aria-label="Additional Views" title="Additional Views" style="display: none;">
								 <div class="badge-content" style="color: rgb(255, 255, 255); background-color: rgb(77, 77, 77);"></div>
							</div>
					 </li>
				</ul>
		 </div>
	</div>
	<div class="title-actions terminal-actions">
		 <div class="monaco-toolbar">
				<div class="monaco-action-bar animated">
					 <ul class="actions-container" role="toolbar" aria-label="Terminal actions">
							<li class="action-item select-container" role="presentation">
								 <select class="monaco-select-box" aria-label="Open Terminals." title="1: node, node" style="background-color: rgb(60, 60, 60); color: rgb(240, 240, 240); border-color: rgb(60, 60, 60);">
										<option value="1: node, node">1: node, node</option>
								 </select>
							</li>
							<li class="action-item" role="presentation"><a class="hidden action-label icon terminal-action new" role="button" title="New Terminal"></a></li>
							<li class="action-item" role="presentation"><a class="hidden action-label icon terminal-action split" role="button" title="Split Terminal (⌘\)"></a></li>
							<li class="action-item" role="presentation"><a class="hidden action-label icon terminal-action kill" role="button" title="Kill Terminal"></a></li>
							<li class="action-item" role="presentation"><a class="hidden action-label icon maximize-panel-action" role="button" title="Maximize Panel Size"></a></li>

							<li class="action-item ${pvControlsClass("lock")}"
								role="presentation"
								data-type="lock"
							>
								<a class="action-label icon lock-panel-action" data-type="lock" role="button" title="Lock Preview"></a>
							</li>

							<li class="action-item" role="presentation"><a class="disabled action-label icon hide-panel-action" role="button" title="Close Panel"></a></li>
					 </ul>
				</div>
		 </div>
	</div>
	`;
	const termMenuActions = termMenu.querySelector('.terminal-actions');

	const previewContainer = document.createElement('div');
	previewContainer.classList.add('preview-contain');
	const showIframe = selected === "preview";
	!showIframe && previewContainer.classList.add('hidden');
	// const iframeUrl = showIframe
	// 	? "./reveal.html"
	// 	: "";
	const iframeUrl=""
	previewContainer.innerHTML = `
		<style>
			.preview-contain {
				position: absolute;
				left: 0;
				right: 0;
				top: 0px;
				bottom: 0px;
				background: #1d1d1d;
				z-index: 9;
			}
			#terminal iframe {
				position: relative;
				top: 0;
				right: 0;
				left: 0;
				bottom: 0;
				width: 100%;
				height: 100%;
				z-index: 100;
				border: 0px;
			}
		</style>
		<iframe src="${iframeUrl}"></iframe>
	`;

	const terminalPane = document.getElementById('terminal')
	terminalPane.appendChild(termMenu);
	terminalPane.appendChild(termContainer);
	terminalPane.appendChild(previewContainer);

	let previewIframe = previewContainer.querySelector('iframe');

	term.open(document.querySelector('#terminal .term-contain'));

	// term.prompt = () => {
  //   term.write("\r\n$ ");
	// };
	let charBuffer = [];
	const onEnter = function(callback){
		if(!charBuffer.length){
			return;
		}
		const command = charBuffer.join('');

		let preventDefault;
		try {
			preventDefault = EventTrigger(command, callback);
		}catch(e){}
		if(preventDefault){
			charBuffer = [];
			return;
		}


		term.write('\n');
		tryExecCommand({
			command,
			loading: (m) => term.write(m),
			done: (m) => {
				m && term.write(m);
				setTimeout(() => fitAddon.fit(), 10);
				callback && callback();
			}
		});
		charBuffer = [];
		//term.write("\n$ ");
	};

	function prompt(term) {
		term.write('\x1B[38;5;14m \r\n∑ \x1B[0m');
	}

	term.onKey((e) => {
		const printable = !e.domEvent.altKey && !e.domEvent.altGraphKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;
		if (e.domEvent.keyCode === 13) {
				if(['cls', 'clear'].includes(charBuffer.join(''))){
					charBuffer = [];
					term.write('\x1B[2K');
					term.clear();
					term.write('\n\x1B[38;5;14m \r∑ \x1B[0m');
					//prompt(term);
					return;
				}
				onEnter(() => {
					prompt(term);
				});
		} else if (e.domEvent.keyCode === 8) {
				// Do not delete the prompt
				if (term._core.buffer.x > 2) {
						charBuffer.pop();
						term.write('\b \b');
				}
		} else if (printable) {
			if(e.key.length === 1){
				charBuffer.push(e.key);
			}
			term.write(e.key);
		}
	});

	term.onResize(() => {
		fitAddon.fit();
	});

	// not sure if this is really needed
	window.termResize = () => {
		fitAddon.fit();
	};

	window.addEventListener('resize', function() {
		fitAddon.fit();
	});

	fitAddon.fit();

	if(window.FUN){
		term.write(
			motd[Math.floor(Math.random() * motd.length)]
		);
	} else {
		term.write(`\x1B[38;5;242m
			Bartok Service Composer v0.4
		\x1B[0m`.replace(/\t/g, ''));
	}

	prompt(term);
	window.term = term;

	const updateLockIcon = (locked) => {
		const lockIconLi = termMenuActions.querySelector('.lock-action');
		if(locked){
			lockIconLi.classList.add('checked');
		} else {
			lockIconLi.classList.remove('checked');
		}
	};

	let alreadyUpdatedOnce;
	function updateIframeRaw({ url, src}){
		previewContainer.removeChild(previewIframe);
		previewIframe = document.createElement('iframe');
		previewContainer.appendChild(previewIframe);

		const iframeDoc = previewIframe.contentWindow.document
		//previewIframe.contentWindow.location.href="about:blank";

		iframeDoc.open("text/html", "replace");
		iframeDoc.write(src);
		iframeDoc.close();

		// another way of doing it
		//iframeDoc.src="javascript:'"+doc+"'";

		// yet another way of doing it
		//iframeDoc.srcdoc = doc;
		alreadyUpdatedOnce = true;
	}

	const updateIframe = debounce(updateIframeRaw, 300);

	function viewUpdate({ view, type, doc, docName, locked }){
		type !== "forceRefreshOnPersist" && updateLockIcon(locked);
		const src = (docName||'').includes('jsx')
			? templateJSX(doc)
			: doc.includes('/* svcV3 ')
				? templateSVC3(doc)
				: doc;

		if(type === "viewSelect"){
			const switcher = document.querySelector("#terminal-menu .panel-switcher-container");
			const termMenuActions = document.querySelector("#terminal-menu .terminal-actions");
			const previewControls = Array.from(termMenuActions.querySelectorAll('.preview-control'));

			Array.from(switcher.querySelectorAll(".action-item.checked"))
				.forEach(el => el.classList.remove('checked'));

			const newCheckedItem = switcher.querySelector(`.action-label[data-type=${view}]`);
			newCheckedItem.parentNode.classList.add('checked');

			if(view !== 'preview'){
				previewControls.forEach(pc => pc.classList.add('hidden'));
				previewContainer.classList.add('hidden');
			} else {
				previewControls.forEach(pc => pc.classList.remove('hidden'));
				if(!locked || !alreadyUpdatedOnce) {
					updateIframe({ src });
				}

				previewContainer.classList.remove('hidden');
			}
			return;
		}

		if(!locked && type === "fileClose" && !doc ){
			debugger;
			updateIframe({ src: "" });
			return;
		}
		if(type === "forceRefreshOnPersist"){
			updateIframeRaw({ src });
			return;
		}
		if(
			type === "fileClose" ||
			type === "termMenuAction" ||
			type === "fileSelect" ||
			type === "fileChange"
		){
			if(!locked || !alreadyUpdatedOnce){
				updateIframe({ src });
			}
			return;
		}
	}

	function terminalActions({ view, type, doc, docName, locked }){
		updateLockIcon(locked);
		//console.log({ view, type, doc, docName, locked });
		//termMenuAction
	}


	attachTrigger({
		target: termMenu.querySelector('.view-switcher'),
		domEvents: ['click'],
		type: 'viewSelect',
		selector: (e) => e.target.tagName === 'A',
		handler: (e) => ({ view: e.target.dataset.type })
	});
	attachTrigger({
		target: termMenu.querySelector('.terminal-actions'),
		domEvents: ['click'],
		type: 'termMenuAction',
		selector: (e) => e.target.tagName === 'A'
			&& e.target.parentNode.parentNode.classList.contains('actions-container'),
		handler: (e) => ({ action: e.target.dataset.type })
	});

	EventTrigger = attachEvents({
		getCurrentService,
		write: (x) => term.write(x),
		viewUpdate,
		terminalActions
	});
}

export default _Terminal;
