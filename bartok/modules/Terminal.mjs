//import "https://cdn.jsdelivr.net/npm/xterm@4.4.0/lib/xterm.min.js";
//import "https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.3.0/lib/xterm-addon-fit.js";
import "/shared/vendor/xterm.min.js";
import "/shared/vendor/xterm-addon-fit.js";

import motd from "./motd.mjs";

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
		const id = Number(_id);

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
			if(!id){
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

function _Terminal(){
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

	const termMenu = document.createElement('div');
	termMenu.id = "terminal-menu";
	termMenu.innerHTML = `
	<div class="composite-bar panel-switcher-container">
		 <div class="monaco-action-bar">
				<ul class="actions-container" role="toolbar" aria-label="Active View Switcher">
					 <li class="action-item checked" role="tab" draggable="true" tabindex="0" active>
							<a class="action-label terminal" style="color: rgb(231, 231, 231); border-bottom-color: rgba(128, 128, 128, 0.35);">Terminal</a>
							<div class="badge" aria-hidden="true" style="display: none;">
								 <div class="badge-content" style="color: rgb(255, 255, 255); background-color: rgb(77, 77, 77);"></div>
							</div>
					 </li>
					 <li class="action-item" role="tab" draggable="true" tabindex="1" active>
							<a class="action-label logs" style="">Logs</a>
						</li>
					 <li class="action-item" role="button" tabindex="0" aria-label="Additional Views" title="Additional Views">
							<a class="action-label toggle-more" aria-label="Additional Views" title="Additional Views" style="background-color: rgb(30, 30, 30);"></a>
							<div class="badge" aria-hidden="true" aria-label="Additional Views" title="Additional Views" style="display: none;">
								 <div class="badge-content" style="color: rgb(255, 255, 255); background-color: rgb(77, 77, 77);"></div>
							</div>
					 </li>
				</ul>
		 </div>
	</div>
	<div class="title-actions">
		 <div class="monaco-toolbar">
				<div class="monaco-action-bar animated">
					 <ul class="actions-container" role="toolbar" aria-label="Terminal actions">
							<li class="action-item select-container" role="presentation">
								 <select class="monaco-select-box" aria-label="Open Terminals." title="1: node, node" style="background-color: rgb(60, 60, 60); color: rgb(240, 240, 240); border-color: rgb(60, 60, 60);">
										<option value="1: node, node">1: node, node</option>
								 </select>
							</li>
							<li class="action-item" role="presentation"><a class="action-label icon terminal-action new" role="button" tabindex="0" title="New Terminal"></a></li>
							<li class="action-item" role="presentation"><a class="action-label icon terminal-action split" role="button" tabindex="0" title="Split Terminal (⌘\)"></a></li>
							<li class="action-item" role="presentation"><a class="action-label icon terminal-action kill" role="button" tabindex="0" title="Kill Terminal"></a></li>
							<li class="action-item" role="presentation"><a class="action-label icon maximize-panel-action" role="button" tabindex="0" title="Maximize Panel Size"></a></li>
							<li class="action-item" role="presentation"><a class="action-label icon hide-panel-action" role="button" tabindex="0" title="Close Panel"></a></li>
					 </ul>
				</div>
		 </div>
	</div>
	`;

	const terminalPane = document.getElementById('terminal')
	terminalPane.appendChild(termMenu);
	terminalPane.appendChild(termContainer);

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
					term.write('\x1B[38;5;14m \r∑ \x1B[0m');
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

	fitAddon.fit();

	if(window.FUN){
		term.write(
			motd[Math.floor(Math.random() * motd.length)]
		);
	} else {
		term.write(`\x1B[38;5;242m
			Bartok Service Composer v0.2
		\x1B[0m`.replace(/\t/g, ''));
	}

	prompt(term);
	window.term = term;
}

export default _Terminal;
