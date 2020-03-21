import "https://cdn.jsdelivr.net/npm/xterm@4.4.0/lib/xterm.min.js";
import "https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.3.0/lib/xterm-addon-fit.js";

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
	// term.onLineFeed(function(){
	// 	term.write("\n$ ");
	// });

	function prompt(term) {
		term.write('\r\n$ ');
	}
	term.prompt = () => {
			term.write('\r\n$ ');
	};
	term.onKey((e) => {
		const printable = !e.domEvent.altKey && !e.domEvent.altGraphKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;
		if (e.domEvent.keyCode === 13) {
				prompt(term);
		} else if (e.domEvent.keyCode === 8) {
				// Do not delete the prompt
				if (term._core.buffer.x > 2) {
						term.write('\b \b');
				}
		} else if (printable) {
				term.write(e.key);
		}
	});
	// term.onData(function(data) {
  //   term.write(data);
	// });



	fitAddon.fit();
	// (new Array(999)).fill().forEach(x =>
	// 	term.write('\n')
	// );
	term.write('\n\n')
	term.write('Hello from \x1B[1;3;31mbartok!\x1B[0m\n'.replace(/\r/g, '\n\r'))


	prompt(term);
}

export default _Terminal;