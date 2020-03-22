//import "https://cdn.jsdelivr.net/npm/xterm@4.4.0/lib/xterm.min.js";
//import "https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.3.0/lib/xterm-addon-fit.js";
import "/shared/vendor/xterm.min.js";
import "/shared/vendor/xterm-addon-fit.js";

import { motd1, motd1o1, motd2, motd3 } from "./motd.mjs";

function tryExecCommand({ command, loading, done }){
		const [ op, ...args] = command.split(' ');
		const [ id, name, ...other] = args;
		let after;

		const ops = [
			"cancel", "create", "read", "update", "delete", "manage", "monitor", "persist"
		];
		if(!ops.includes(op.toLowerCase())){
			done(`${command}:  command not found!\nSupported: ${ops.join(', ')}\n`);
			return;
		}

		const body = id !== undefined
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
					loading(`\n
					${result.result.map(x => `${x.id.toString().padStart(5, ' ')}   ${x.name}`).join('\n')}
					\n`.replace(/\t/g, ''));
				};
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
				operation: op.toLowerCase(),
				listener: Math.random().toString().replace('0.', ''),
				done, after,
				body
			}
		});
		document.body.dispatchEvent(event);

		//TODO: listen for when it's done
		loading(`${command}: running... `);
	};

function _Terminal(){
	const options = {
		theme: {
			foreground: '#ffffff',
			//background: '#000',
			background: '#1e1e1e',
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
		fontSize: 13,
		convertEol: true
	};

	const term = new Terminal(options);


	const fitAddon = new (FitAddon.FitAddon)();
	term.loadAddon(fitAddon);

	//console.log({ term, Terminal });
	term.open(document.getElementById('terminal'));

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
				term.write(m);
				callback();
			}
		});
		charBuffer = [];
		//term.write("\n$ ");
	};

	function prompt(term) {
		term.write('\x1b[1;30m \r\n$ \x1B[0m');
	}

	term.onKey((e) => {
		const printable = !e.domEvent.altKey && !e.domEvent.altGraphKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;
		if (e.domEvent.keyCode === 13) {
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

	fitAddon.fit();
	term.write(motd1o1)

	prompt(term);
}

export default _Terminal;