import Split from "https://dev.jspm.io/split-grid";
//import "https://dev.jspm.io/materialize-css/dist/js/materialize.min.js";
// ^^^ not working ?

//TODO: should also append CSS needed
/*

<script src="https://unpkg.com/split-grid/dist/split-grid.js"></script>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link crossorigin="anonymous" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">

*/

const appendScript = (callback) => {
	var materializeScript = document.createElement('script');
	materializeScript.crossOrigin = "anonymous";
	materializeScript.onload = callback;
	materializeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js";
	document.head.appendChild(materializeScript);
};

const setupApp = () => {
	const splitInstance = Split({
		rowCursor: 'ns-resize',
		rowGutters: [{
			track: 2,
			element: document.querySelector('.gutter-footer'),
		}],
		onDragStart: () => {
			document.documentElement.classList.add("ns-draggable-cursor");
		},
		onDragEnd: () => {
			document.documentElement.classList.remove("ns-draggable-cursor");
		}
	});

	//materialize
	function setupSideNav() {
		var elems = document.querySelectorAll('.sidenav');
		var options = {};
		var instances = M.Sidenav.init(elems, options);
		return instances;
	}
	const sideNav = setupSideNav();

	/* Get the documentElement (<html>) to display the page in fullscreen */
	var elem = document.documentElement;

	/* View in fullscreen */
	function openFullscreen(e) {
		if (elem.requestFullscreen) {
			elem.requestFullscreen();
		} else if (elem.mozRequestFullScreen) { /* Firefox */
			elem.mozRequestFullScreen();
		} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
			elem.webkitRequestFullscreen();
		} else if (elem.msRequestFullscreen) { /* IE/Edge */
			elem.msRequestFullscreen();
		}
		//e.stopPropagation();
		return false;
	}

	/* Close fullscreen */
	function closeFullscreen(e) {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.mozCancelFullScreen) { /* Firefox */
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
			document.webkitExitFullscreen();
		} else if (document.msExitFullscreen) { /* IE/Edge */
			document.msExitFullscreen();
		}
		//e.stopPropagation();
		return false;
	}

	const cons = {
		show: (e) => {
			document.querySelector('.grid-container').style['grid-template-rows'] = 'auto 1fr 3px 300px';
			//e.stopPropagation();
			return false;
		},
		hide: (e) => {
			document.querySelector('.grid-container').style['grid-template-rows'] = 'auto 1fr 3px 0px';
			//delete document.querySelector('.grid-container').style['grid-template-rows'];
			//e.stopPropagation();
			return false;
		}
	}

	const materialize = { sideNav, M };

	return { split: splitInstance, materialize, openFullscreen, closeFullscreen, console: cons };
};

export default (callback) => {
	appendScript(() => {
		const app = setupApp();
		callback(null, app);
	});
};
