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

  |            .
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


export {
	motd1, motd1o1, motd2, motd3
};
