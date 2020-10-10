import {
	attach as connectListener,
	attachTrigger as connectTrigger
} from './Listeners.mjs';

const safe = fn => { try{ return fn(); } catch(e){} }

function htmlToElement(html) {
	var template = document.createElement('template');
	template.innerHTML = html.trim();
	return template.content.firstChild;
}

let paletteModal;
function PaletteModal(parentEl){
	if(paletteModal) return paletteModal;

	const style = `
	<style>
		#paletteModal ::-webkit-scrollbar * { background:transparent; }
		#paletteModal ::-webkit-scrollbar { width: 5px; }
		#paletteModal ::-webkit-scrollbar-track { background: transparent; -webkit-box-shadow: none; opacity: 0; }
		#paletteModal ::-webkit-scrollbar-thumb { background: rgb(57, 57, 58); }
		#paletteModal ::-webkit-scrollbar-thumb:hover { background: rgb(77, 77, 78); }

		/* TODO: enable the following some fancy day */
		/* #paletteModal ::-webkit-scrollbar { display: none; } */
		/* #paletteModal:hover ::-webkit-scrollbar { display: block; } */

		#paletteModal {
			position: absolute;
			top: 1px;
			width: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			visibility: hidden;
		}
		#paletteModal.open {
			visibility: visible;
		}
		#paletteModal .palette-menu {
			background-color: rgb(37, 37, 38);
			color: rgb(204, 204, 204);
			box-shadow: rgb(0, 0, 0) 0px 5px 8px;
			width: 600px;
		}
		#paletteModal .palette-menu:focus {
			outline: none;
		}
		.palette-title { display: none; }
		.palette-title.visible {
			display: inherit;
			padding: 5px 5px 3px 5px;
			text-align: center;
			background: #3b3b3c;
		}
		.palette-input { display: flex; padding: 5px; }
		.palette-input input {
			background: var(--main-theme-background-color) !important;
			margin: 0 !important;
			border: 0 !important;
			color: var(--main-theme-text-color);
			padding-left: .5em !important;
			padding-right: .5em !important;
			font-size: 1.1em !important;
			box-sizing: border-box !important;
			padding-top: .25em !important;
			padding-bottom: .25em !important;
			height: unset !important;
			transition: unset !important;
			border: 1px solid !important;
			border-color: transparent !important;
		}
		.palette-input > button { display: none; }
		.palette-input > button.visible {
			display: inherit;
			margin: 0 0 0 5px;
			background: rgba(var(--main-theme-highlight-color),0.5);
			border: 0;
			color: var(--main-theme-text-color);
			filter: contrast(1.5);
			padding: 0 5px;
		}
		.palette-input input:focus {
			box-shadow: none !important;
			border-color: rgb(var(--main-theme-highlight-color)) !important;
		}
		.palette-progress { display: none; }
		.palette-progress.visible {
			display: inherit;
			height: 1px;
			width: 100%;
			background: rgba(var(--main-theme-highlight-color), 1);
		}
		.palette-suggest ul {
			margin: 5px 0px 5px 5px; /* lame - scrollbar makes me do this */
			max-height: 500px;
			overflow-x: hidden;
			overflow-y: scroll;
		}
		.palette-suggest ul li {
			padding: 3px 10px 3px 10px;
		}
		.palette-suggest ul li.selected {
			background: rgba(var(--main-theme-highlight-color), 0.3);
		}
	</style>`;

	const getCommandItems = async () => {
		return new Array(100).fill().map((x, i) => `Command ${i}`);
	};
	const getFileItems = () => {
		return new Promise((resolve) => {
			const fakeResults = new Array(10).fill().map((x, i) => `icon - filename${i} - folder`);
			setTimeout(() => resolve(fakeResults), 3000);
		})
	};

	paletteModal = htmlToElement(`
		<div id="paletteModal">
			${style}
			<div class="palette-menu" tabindex="-1">
				<div class="palette-title">Title</div>
				<div class="palette-input">
					<input type="text">
					<button>OK</button>
				</div>
				<div class="palette-progress"></div>
				<div class="palette-suggest">
					<ul></ul>
				</div>
			</div>
		</div>
	`.replace(/		/g,''));
	const modalMenu = paletteModal.querySelector('.palette-menu');
	const suggestList = paletteModal.querySelector('.palette-suggest');

	const modalClickListener = (event) => {
		const modalWasClicked = modalMenu.contains(event.target);
		if(!modalWasClicked) return paletteModal.hide();

		console.log('modal was clicked!');
		//todo - trigger some event here
	};

	const keyListener =  function(event){
		const handler = {
			"Escape": paletteModal.hide,
			"ArrowUp": () => {
				const selectedEl = suggestList.querySelector('li.selected');
				const previous = selectedEl.previousElementSibling;
				if(!previous) return;
				selectedEl.classList.remove('selected');
				previous.classList.add('selected');
				previous.scrollIntoView({
					behavior: 'smooth', block: 'nearest'
				});
			},
			"ArrowDown": () => {
				const selectedEl = suggestList.querySelector('li.selected');
				const next = selectedEl.nextElementSibling;
				if(!next) return;
				selectedEl.classList.remove('selected');
				next.classList.add('selected');
				next.scrollIntoView({
					behavior: 'smooth', block: 'nearest'
				});
			}
		}[event.key];
		if(handler){
			handler();
			event.preventDefault();
			return false;
		}
	}

	paletteModal.show = async (event) => {
		const listHTML = arr => `<ul>${
			arr.map((x,i) => `<li${i===0?' class="selected"':''}>${x}</li>`)
			.join('\n')
		}</ul>`;

		const listHandler = {
			"savePalette": async () => {},
			"commandPalette": async (listEl) => listEl.innerHTML = listHTML(await getCommandItems()),
			"searchPalette": async (listEl) => listEl.innerHTML = listHTML(await getFileItems())
		}[safe(() => event.detail.operation)];
		if(!listHandler) return console.error(`unable to display palette for: ${event.detail}!`);

		suggestList.innerHTML = '<ul><li>loading...</li></ul>';
		listHandler(suggestList)

		paletteModal.classList.add('open');
		parentEl.show();
		setTimeout(() => modalMenu.querySelector('.palette-input input').focus(), 0);
		document.body.addEventListener('click', modalClickListener, true);
		modalMenu.addEventListener("blur", modalClickListener, true);
		document.body.addEventListener('keydown', keyListener, true);
	};
	paletteModal.hide = (event) => {
		parentEl.hide();
		paletteModal.classList.remove('open');
		document.body.removeEventListener('keydown', keyListener, true);
		document.body.removeEventListener('click', modalClickListener, true);
		modalMenu.removeEventListener('blur', modalClickListener, true);
	};

	return paletteModal;
}

let contextPane;
function ContextPane() {
	if (contextPane) {
		return contextPane;
	}
	contextPane = document.createElement('div');
	contextPane.classList.add('ContextOverlay');

	contextPane.innerHTML = `
<style>
.ContextOverlay {
	--horiz-pad: 20px;
	--vert-pad: 10px;
	--sep-height: 10px;
}
.ContextOverlay {
	position: absolute;
	left: 0; top: 0;
	z-index: 999;
	visibility: hidden;
	pointer-events: none;
	background-color: transparent;
	transition: background-color 0.5s ease;
}
.ContextContainer {
	position: relative;
	width: 100vw;
	height: 100vh;
}
.ContextMenu {
	position: absolute;
	background: transparent;
	visibility: hidden;
}
.ContextMenu .menu-container {
	position: relative;
}
.ContextMenu .menu-container:after {
	content: '';
	position: absolute;
	background: var(--main-theme-background-color);
	border: 1px solid #777;
	box-shadow: 3px 2px 5px black;
	border-radius: 3px;
	opacity: 0.9;
	width: 100%;
	height: 100%;
	backdrop-filter: blur(5px);
	z-index: -1;
	top: 0;
}
.ContextMenu.open {
	visibility: visible;
	pointer-events: all;
}
.ContextMenu ul.list {
	margin: 0; padding: var(--vert-pad) 0;
	min-width: 185px;
	user-select: none;
}
.ContextMenu .list .item button {
	background: transparent;
	border: 0;
	color: white;
	padding: 2px var(--horiz-pad);
	width: 100%;
	text-align: left;
	pointer-events: none; /* so clicks are never registered on this element */
}
.ContextMenu .list .item:hover {
	background: rgb(var(--main-theme-highlight-color));
}
.ContextMenu .list .item {
	line-height: 0;
}
.ContextMenu .list .item.disabled {
    user-select: none;
    pointer-events: none;
    opacity: 0.4;
}
.ContextMenu .list .context-seperator {
	margin: calc(var(--sep-height) / 2) 0px;
	color: #4a4a4a;
	border-bottom: 1px solid;
}

</style>
	`;

	contextPane.innerHTML += `
<div class="ContextContainer">
	<div class="ContextMenu">
		<div class="menu-container">
			<ul class="list">
			</ul>
		</div>
	</div>
</div>
	`;

	const menuItem = (item) => item === 'seperator'
	? `<li class="context-seperator"></li>`
	: `
		<li class="item${ item.disabled ? ' disabled' : ''}" data-text="${item.name}">
			<button name="${item.name}" class="">
				<div class="linkContent">
					<span class="itemText">${item.name}</span>
				</div>
			</button>
		</li>
	`;

	contextPane.show = () => {
		contextPane.style.visibility = 'visible';
		contextPane.style.pointerEvents = 'all';
		contextPane.style.backgroundColor = "#00000029";
	}
	contextPane.hide = () => {
		contextPane.style.removeProperty('visibility');
		contextPane.style.removeProperty('pointerEvents');
		contextPane.style.removeProperty('backgroundColor');
	}

	contextPane.appendChild(PaletteModal(contextPane));
	document.body.appendChild(contextPane);

	function hideMenu(){
		contextPane.hide();
		const Menu = contextPane.querySelector('.ContextMenu')
		Menu.classList.remove('open');
	}

	function showMenu({
		x=0, y=0, parent='unknown', data, list
	}={}){
		// warn if menu will appear offscreen?
		// handle case where menu is opened near edge of screen

		// menu should know what items to show

		// menu items should know what event to trigger

		contextPane.show();

		const listDiv = contextPane.querySelector('.list');
		listDiv.innerHTML = list.map(menuItem).join('\n');

		const Menu = contextPane.querySelector('.ContextMenu')
		Menu.classList.add('open');
		Menu.style.top = y + 'px';
		Menu.style.left = x + 'px';

		//attach a listener to body that hides menu and detaches itself
		const menuClickListener = (event) => {
			const menuWasClicked = Menu.contains(event.target);
			if(menuWasClicked && event.target.tagName !== 'LI'){ return; }

			hideMenu();
			document.body.removeEventListener('click', menuClickListener, false);
			if(!menuWasClicked){ return; }

			contextMenuSelect({
				detail: {
					which: event.target.dataset.text,
					parent, data
				}
			});
		};
		document.body.addEventListener('click', menuClickListener);
	}
	window.showMenu = showMenu;
	window.hideMenu = hideMenu;

	const contextMenuSelect = connectTrigger({
		name: 'Context Menu',
		eventName: 'contextmenu-select',
		type: 'raw'
	});

	connectListener({
		name: 'Context Menu',
		eventName: 'context-menu-show',
		listener: (event) => {
			console.error('TODO: context-menu-show versus window.showMenu!');
		}
	});

	connectListener({
		name: 'Context Menu',
		eventName: 'modal-menu-show',
		listener: (event) => {
			console.error('TODO: context-menu-show versus window.showMenu!');
		}
	});

	connectListener({
		name: 'Context Menu',
		eventName: 'ui',
		listener: (event) => {
			const { detail } = event;
			const toHandle = ["savePalette", "commandPalette", "searchPalette"];
			if(!toHandle.includes(detail.operation)) return;
			// alert(`${detail.operation}: not implemented`)
			paletteModal.show(event);
		}
	});

}

export default ContextPane;
