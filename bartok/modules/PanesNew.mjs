/*


https://iamakulov.com/notes/resize-scroll/


*/

// function is used for dragging and moving
function dragElement(element, direction, handler, first, second, firstUnder, secondUnder) {

	//const firstRightX = document.documentElement.clientWidth * second.style.left.replace("%", "");
	// const secondWidthX = second.style.width.replace("px", "");

	//first.style.right = 100 * firstRightX / document.documentElement.clientWidth + "%";
	//second.style.right = 100 * (firstRightX - secondWidthX) / document.documentElement.clientWidth + "%";


	first.style.width = "";
	second.style.width = "";

	let firstEdge = first.style.left;
	let secondEdge = second.style.left;
	let thirdEdge = second.style.right;

	// Two variables for tracking positions of the cursor
	const drag = { x: 0, y: 0 };
	const delta = { x: 0, y: 0 };
  /* if present, the handler is where you move the DIV from
     otherwise, move the DIV from anywhere inside the DIV */
	handler
		? (handler.onmousedown = dragMouseDown)
		: (element.onmousedown = dragMouseDown);

	// function that will be called whenever the down event of the mouse is raised
	let dragging;
	function dragMouseDown(e) {
		if(dragging){
			return false;
		}
		dragging = true;

		//console.log("dragMouseDown");
		first.style.minWidth = "";
		second.style.minWidth = "";

		first.classList.add('active-pane-guide');
		second.classList.add('active-pane-guide');
		first.style.borderRight = "1px solid #555";
		second.style.borderLeft = "1px solid #555";
		console.log(`Change right border for:`)
		console.log(first);
		console.log(`Change left border for:`)
		console.log(second);

		// drag.x = e.clientX;
		// drag.y = e.clientY;
		document.onmousemove = onMouseMove;
		document.onmouseup = (e) => {
			onMouseUp(e);
			first.classList.remove('active-pane-guide');
			second.classList.remove('active-pane-guide')
			document.onmousemove = document.onmouseup = null;
		}

		e.preventDefault();
		return false;
	}

	function onMouseUp(e) {
		console.log("mouseUp! resize!")

		element.style.position = "absolute";
		element.style.left = second.style.left;

		firstUnder.style.position = "absolute";
		firstUnder.style.width = first.style.width;
		firstUnder.style.left = first.style.left;
		firstUnder.style.right = first.style.right;

		secondUnder.style.position = "absolute";
		secondUnder.style.width = second.style.width;
		secondUnder.style.left = second.style.left;
		secondUnder.style.right = second.style.right;

		first.style.borderRight = "";
		second.style.borderLeft = "";

		window.termResize();
		dragging = false;
	}

	let timeout;
	function onMouseMove(e) {

		const currentX = e.clientX;

		// If there's a timer, cancel it
		if (timeout) {
			window.cancelAnimationFrame(timeout);
		}

		//TODO: pause codemirror rendering while resizing
		//https://discuss.codemirror.net/t/force-repaint-of-entire-cm-instance/498/2

		// Setup the new requestAnimationFrame()
		timeout = window.requestAnimationFrame(function () {
			//TODO: debounce/change the width of under elements!?!?

			//console.log("onMouseMove");


			// secondEdge = currentX + "px";
			const firstRightPercent = 100 * (1 - (currentX / document.documentElement.clientWidth));
			const secondStyleLeft = 100 * (currentX / document.documentElement.clientWidth);

			//TODO: set min and max sizing bounds
			first.style.right = firstRightPercent + "%";
			second.style.left = secondStyleLeft + "%";

			element.style.position = "absolute";
			element.style.left = second.style.left;

			firstUnder.style.position = "absolute";
			firstUnder.style.width = first.style.width;
			firstUnder.style.left = first.style.left;
			firstUnder.style.right = first.style.right;

			secondUnder.style.position = "absolute";
			secondUnder.style.width = second.style.width;
			secondUnder.style.left = second.style.left;
			secondUnder.style.right = second.style.right;

			//window.termResize()

			timeout = undefined;
		});


		e.preventDefault();
		return false;
	}
}

function attachListeners() {
	dragElement(
		document.getElementById("seperator1"),
		"H", null,
		document.getElementById("explorer-cover"),
		document.getElementById("editor-cover"),
		document.getElementById("explorer"),
		document.getElementById("editor")
	);
	dragElement(
		document.getElementById("seperator2"),
		"H", null,
		document.getElementById("editor-cover"),
		document.getElementById("terminal-cover"),
		document.getElementById("editor"),
		document.getElementById("terminal")
	);
}

// TODO: resizeStart and resizeEnd events should be triggered so contents can adjust!!
// TODO: should also be listening to window.resize event and adjusting panes!!!
let panes;
function Panes() {
	if (panes) {
		return panes;
	}
	const splitter = document.createElement('div');
	splitter.id = "project-splitter";
	splitter.classList.add('splitter');

	const explorerRight = 100 * (1 - (250 / document.documentElement.clientWidth));

	splitter.innerHTML = `
		<style>
			#cover-container{
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				z-index: 99999;
				display: flex;
				justify-content: space-evenly;
				pointer-events: none;
			}
			#terminal-cover {
				right: 0 !important;
			}
			div.pane-cover {
				background: transparent;
				height: 100%;
				opacity: 0;
				position: absolute;
				top: 0px;
				bottom: 0px;
				transition: opacity .25s ease-in;
			}
			div.pane-cover.active-pane-guide {
				opacity: 1;
			}
		</style>
		<div id="actionbar"></div>

		<div id="explorer" style="position: absolute; left: 50px; right: ${explorerRight}%;"></div>
		<div class="seperator" id="seperator1" style="position: absolute; left: ${100-explorerRight}%;"></div>
		<div id="editor" style="position: absolute; left: ${100-explorerRight}%; right: 38%;"></div>
		<div class="seperator" id="seperator2" style="position: absolute; left: 62%;"></div>
		<div id="terminal" style="position: absolute; left: 62%; right: 0;"></div>

		<div id="cover-container">
			<div id="actionbar-cover" class="pane-cover" style="background: transparent;"></div>
			<div id="explorer-cover" class="pane-cover" style="position: absolute; left: 50px; right: ${explorerRight}%;"></div>
			<div id="editor-cover" class="pane-cover" style="position: absolute; left: ${100-explorerRight}%; right: 38%;"></div>
			<div id="terminal-cover" class="pane-cover"style="position: absolute; left: 62%; right: 0;"></div>
		</div>

		<div id="services"></div>
	`;

	//TODO: panes should be remembered (and percentages in the first place)

	document.body.appendChild(splitter);

	// const explorer = splitter.querySelector("#explorer");
	// const explorerCover = splitter.querySelector("#explorer-cover")
	// explorerCover.style.left = "50px"; explorer.offsetLeft + "px";
	// explorerCover.style.width = explorer.offsetWidth - 2 + "px";

	// const editor = splitter.querySelector("#editor")
	// const editorCover = splitter.querySelector("#editor-cover");
	// editorCover.style.left = "22%";
	// editorCover.style.right = "38%";

	// const terminal = splitter.querySelector("#terminal");
	// const terminalCover = splitter.querySelector("#terminal-cover")
	// terminalCover.style.left = 50 + explorer.offsetWidth + editor.offsetWidth - 4 + "px";
	// terminalCover.style.width = terminal.offsetWidth + "px";


	attachListeners()
}

export default Panes;