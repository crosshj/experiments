import "https://cdn.jsdelivr.net/npm/xterm@4.4.0/lib/xterm.min.js";

function _Terminal(){

	const term = new Terminal();
	term.open(document.getElementById('terminal'));
}

export default _Terminal;