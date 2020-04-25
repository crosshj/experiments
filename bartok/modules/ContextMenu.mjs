
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
}
.ContextMenu .list .item button:hover {
	background: var(--main-theme-highlight-color);
}
.ContextMenu .list .item {
	line-height: 0;
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
		<li class="item">
			<button name="${item.name}" class="">
				<div class="linkContent">
					<span class="itemText">${item.name}</span>
				</div>
			</button>
		</li>
	`;
	document.body.appendChild(contextPane);

	const listItems = [{
		name: 'New File'
	}, {
		name: 'New Folder'
	}, 'seperator', {
		name: 'Open in Preview'
	}, {
		name: 'Open in Terminal'
	}, 'seperator', {
		name: 'Copy'
	}, {
		name: 'Copy Path'
	}, 'seperator',  {
		name: 'Rename'
	},{
		name: 'Delete'
	}];

	function hideMenu(){
		contextPane.style.removeProperty('visibility');
		contextPane.style.removeProperty('pointerEvents');
		contextPane.style.removeProperty('backgroundColor');

		const Menu = contextPane.querySelector('.ContextMenu')
		Menu.classList.remove('open');
	}

	function showMenu({
		x=0, y=0
	}={}){
		// warn if menu will appear offscreen?

		// menu should know what items to show

		// menu items should know what event to trigger

		contextPane.style.visibility = 'visible';
		contextPane.style.pointerEvents = 'all';
		contextPane.style.backgroundColor = "#00000029";


		const list = contextPane.querySelector('.list');
		list.innerHTML = listItems.map(menuItem).join('\n');

		const Menu = contextPane.querySelector('.ContextMenu')
		Menu.classList.add('open');
		Menu.style.top = y + 'px';
		Menu.style.left = x + 'px';

		//attach a listener to body that hides menu and detaches itself
	}
	window.showMenu = showMenu;
	window.hideMenu = hideMenu;

	//attachListeners({ showMenu });
}

export default ContextPane;
