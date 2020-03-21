import "https://cdn.jsdelivr.net/npm/xterm@4.4.0/lib/xterm.min.js";
import "https://cdn.jsdelivr.net/npm/xterm-addon-fit@0.3.0/lib/xterm-addon-fit.js";


//http://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.html
const rainbow = (text, base, step=3) => {
	return text.split('\n').map((x, i) => {
		// if(i % 2 !== 0){
		// 	return x;
		// }
		return `\x1B[38;5;${Math.floor(base+(i/step))}m ${x}`
	}).join('\n') + `\x1B[0m`;
};

const motd1 = rainbow(`
                                                    :
                                                   t#,     G:
  .                         j.                    ;##W.    E#,    :
  Ef.                    .. EW,       GEEEEEEEL  :#L:WE    E#t  .GE
  E#Wi                  ;W, E##j      ,;;L#K;;. .KG  ,#D   E#t j#K;
  E#K#D:               j##, E###D.       t#E    EE    ;#f  E#GK#f
  E#t,E#f.            G###, E#jG#W;      t#E   f#.     t#i E##D.
  E#WEE##Wt         :E####, E#t t##f     t#E   :#G     GK  E##Wi
  E##Ei;;;;.       ;W#DG##, E#t  :K#E:   t#E    ;#L   LW.  E#jL#D:
  E#DWWt          j###DW##, E#KDDDD###i  t#E     t#f f#:   E#t ,K#j
  E#t f#K;       G##i,,G##, E#f,t#Wi,,,  t#E      f#D#;    E#t   jD
  E#Dfff##E,   :K#K:   L##, E#t  ;#W:    t#E       G#t     j#t
  jLLLLLLLLL; ;##D.    L##, DWi   ,KK:    fE        t       ,;
              ,,,      .,,                 :
`, 28) + `
	Consequences will never be the same!

`;

const motd1o1 = rainbow(`

  .            .
  |-. ,-. ,-. -|- ,-. . ,
  | | ,-| |    |  | | |/
  '-' '-^ '    |  '-' |\\
                      ' \\
`, 195, 1) + `      let's go!\n\n`;

const motd2 = `\x1B[1;3;36m
      ..                                  s                      ..
. uW8"                                   :8                < .z@8"'
't888                      .u    .      .88           u.    !@88E
 8888   .         u      .d88B :@8c    :888ooo  ...ue888b   '888E   u
 9888.z88N     us888u.  ="8888f8888r -*8888888  888R Y888r   888E u@8NL
 9888  888E .@88 "8888"   4888>'88"    8888     888R I888>   888E'"88*"
 9888  888E 9888  9888    4888> '      8888     888R I888>   888E .dN.
 9888  888E 9888  9888    4888>        8888     888R I888>   888E~8888
 9888  888E 9888  9888   .d888L .+    .8888Lu= u8888cJ888    888E '888&
.8888  888" 9888  9888   ^"8888*"     ^%888*    "*888*P"     888E  9888.
 '%888*%"   "888*""888"     "Y"         'Y"       'Y"      '"888*" 4888"
    "'       ^Y"   ^Y'                                        ""    ""

\x1B[0m
	What's getting in your way to success??
`;

const motd3 = `\x1b[1;36m

@@@@@@@    @@@@@@   @@@@@@@   @@@@@@@   @@@@@@   @@@  @@@
@@@@@@@@  @@@@@@@@  @@@@@@@@  @@@@@@@  @@@@@@@@  @@@  @@@
@@!  @@@  @@!  @@@  @@!  @@@    @@!    @@!  @@@  @@!  !@@
!@   @!@  !@!  @!@  !@!  @!@    !@!    !@!  @!@  !@!  @!!
@!@!@!@   @!@!@!@!  @!@!!@!     @!!    @!@  !@!  @!@@!@!
!!!@!!!!  !!!@!!!!  !!@!@!      !!!    !@!  !!!  !!@!!!
!!:  !!!  !!:  !!!  !!: :!!     !!:    !!:  !!!  !!: :!!
:!:  !:!  :!:  !:!  :!:  !:!    :!:    :!:  !:!  :!:  !:!
 :: ::::  ::   :::  ::   :::     ::    ::::: ::   ::  :::
:: : ::    :   : :   :   : :     :      : :  :    :   :::

\x1B[0m
  Falls of my radar!
`;

function tryExecCommand(command){
		const ops = [
			"create", "read", "update", "delete", "manage", "monitor", "persist"
		];
		if(!ops.includes(command.toLowerCase())){
			return `COMMAND: ${command} not found!\n`;
		}
		return `COMMAND:  ${command} running...\n`;
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
	const onEnter = function(){
		if(!charBuffer.length){
			return;
		}
		const command = charBuffer.join('');
		term.write('\n');
		term.write(tryExecCommand(command));
		charBuffer = [];
		//term.write("\n$ ");
	};

	function prompt(term) {
		term.write('\x1b[1;36m \r\n$ \x1B[0m');
	}

	term.onKey((e) => {
		const printable = !e.domEvent.altKey && !e.domEvent.altGraphKey && !e.domEvent.ctrlKey && !e.domEvent.metaKey;
		if (e.domEvent.keyCode === 13) {
				onEnter();
				prompt(term);
		} else if (e.domEvent.keyCode === 8) {
				// Do not delete the prompt
				if (term._core.buffer.x > 2) {
						charBuffer.pop();
						term.write('\b \b');
				}
		} else if (printable) {
				charBuffer.push(e.key);
				term.write(e.key);
		}
	});

	fitAddon.fit();
	term.write(motd1o1)

	prompt(term);
}

export default _Terminal;