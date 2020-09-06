import { attachListener } from './events/services.mjs';

const modifyTransform = (el, attr, value) => {
	const arrRegex = new RegExp(`${attr}\\(.*?\\)`);
	const hasAtt = (el.style.transform||"").match(arrRegex);
	if(!hasAtt){
		return el.style.transform + ` ${attr}(${value})`;
	}
	return el.style.transform.replace(arrRegex, `${attr}(${value})`);
};

const styles = `
<style>

	#services {
		position: absolute;
		left: 50px; top: 0; right: 0; bottom: 0;
		/*background: var(--main-theme-color);*/
		/*background: var(--main-theme-background-color);*/
		background: var(--theme-subdued-color);
    z-index: 99999;
	}

	svg#canvas {
		width: 100%;
		height: 100%;
		min-width: 2000px;
		min-height: 2000px;
${/* FOR VISUAL DEBUGGING */''}
		/* background: #292929; */
	}

	.node-bg {
		fill: #8a663d;
	}

	.node-border-1 {
		stroke: #00000050;
		stroke-width: 4px;
		fill: #000000f0;
	}
	.node-border-2 {
		stroke: #999;
	}
	.node-center-dot {
		fill: #00000070;
	}
	.node-background-circle {
		fill: #88888801;
		r: 120;
		stroke-width: 0;
	}
	.node-label {
		font-size: 15px;
    font-family: inherit;
    text-transform: uppercase;
    color: #1dafa9;
	}

	.trigger-link {
		stroke: #e65a5aa3;
	}

	#canvas * {
		user-drag: none;
		-webkit-user-drag: none;
	}


</style>
`;

function svgChildBringToTop(targetElement){
  // put the element at the bottom of its parent
  let parent = targetElement.parentNode;
  parent.appendChild(targetElement);
}

function rotateArray(array, degrees) {
	const itemsToSlice = (array.length / 360) * Math.abs(degrees);
	return degrees > 0
		? [...array.slice(array.length - itemsToSlice), ...array.slice(0, array.length - itemsToSlice)]
		: [...array.slice(itemsToSlice), ...array.slice(0, itemsToSlice)];
}

function attachPan(_canvas) {
	let transX = 0, transY = 0, offsetX = 0, offsetY = 0;
	const serviceMapTransform = localStorage.getItem('serviceMapTransform');
	if (serviceMapTransform) {
		transX = serviceMapTransform.split(',')[0];
		transY = serviceMapTransform.split(',')[1];
		_canvas.style.transform = modifyTransform(_canvas, 'translate', `${transX}px,${transY}px`);
	}
	const serviceMapZoom = localStorage.getItem('serviceMapZoom');
	if(serviceMapZoom){
		_canvas.style.transform = modifyTransform(_canvas, 'scale', serviceMapZoom);
	}

	_canvas.onpointerdown = (pointerDownEvent) => {
		if(pointerDownEvent.target.id !== 'canvas'){
			return true;
		}
		let firstX = pointerDownEvent.clientX - transX;
		let firstY = pointerDownEvent.clientY - transY;

		const detachListeners = (detachEvent) => {
			transX = offsetX;
			transY = offsetY;
			localStorage.setItem('serviceMapTransform', `${transX},${transY}`)
			document.onpointermove = document.onpointerup = null;
			detachEvent.preventDefault();
			return false;
		};

		document.onpointermove = (pointerMoveEvent) => {
			let currentX = pointerMoveEvent.clientX;
			let currentY = pointerMoveEvent.clientY;
			offsetX = currentX - firstX;
			offsetY = currentY - firstY;
			_canvas.style.transform = modifyTransform(_canvas, 'translate', `${offsetX}px,${offsetY}px`);
			pointerMoveEvent.preventDefault();
			return false;
		};
		document.onpointerup = detachListeners;

		pointerDownEvent.preventDefault();
		return false;
	}
}

const createSVGElement = (type) =>
	document.createElementNS("http://www.w3.org/2000/svg", type);

function Node({ x, y, scale, label, labelDistance = 160 }) {
	const node = createSVGElement('g');
	node.classList.add('node');
	node.innerHTML = `
		<g transform="translate(${x},${y}) scale(${scale})" draggable="false">
			<circle class="node-background-circle"></circle>
			<g class="_GraphNodeStatic__GraphNodeWrapper-xnsael-0 cNyCOA">
				<foreignObject y="${labelDistance}" x="-68.75" width="137.5" height="20px" style="pointer-events: none; text-align: center;">
					<div class="r">
						<div class="node-label">
							<span title="${label}">${label}</span>
						</div>
						<div class="matched-results"></div>
					</div>
				</foreignObject>
				<g transform="scale(55)">
					<path class="node-bg" d="M0.8660254037844386,-0.5000000000000001C0.9165435523385308,-0.41250000000000014,0.916543552338531,0.41249999999999976,0.8660254037844388,0.4999999999999998C0.8155072552303466,0.5874999999999998,0.10103629710818461,1,1.2246467991473532e-16,1C-0.10103629710818436,1,-0.8155072552303461,0.5875000000000004,-0.8660254037844384,0.5000000000000004C-0.9165435523385307,0.4125000000000005,-0.9165435523385312,-0.41249999999999926,-0.866025403784439,-0.4999999999999993C-0.8155072552303468,-0.5874999999999992,-0.10103629710818451,-1,0,-1C0.10103629710818451,-1,0.8155072552303464,-0.5875000000000001,0.8660254037844386,-0.5000000000000001" style="stroke: none;" transform="scale(0.48)"></path>
					<path class="node-border-1" d="M0.8660254037844386,-0.5000000000000001C0.9165435523385308,-0.41250000000000014,0.916543552338531,0.41249999999999976,0.8660254037844388,0.4999999999999998C0.8155072552303466,0.5874999999999998,0.10103629710818461,1,1.2246467991473532e-16,1C-0.10103629710818436,1,-0.8155072552303461,0.5875000000000004,-0.8660254037844384,0.5000000000000004C-0.9165435523385307,0.4125000000000005,-0.9165435523385312,-0.41249999999999926,-0.866025403784439,-0.4999999999999993C-0.8155072552303468,-0.5874999999999992,-0.10103629710818451,-1,0,-1C0.10103629710818451,-1,0.8155072552303464,-0.5875000000000001,0.8660254037844386,-0.5000000000000001" style="fill: none; stroke-width: 0.18px;" transform="scale(0.49)"></path>
					<path class="node-border-2" d="M0.8660254037844386,-0.5000000000000001C0.9165435523385308,-0.41250000000000014,0.916543552338531,0.41249999999999976,0.8660254037844388,0.4999999999999998C0.8155072552303466,0.5874999999999998,0.10103629710818461,1,1.2246467991473532e-16,1C-0.10103629710818436,1,-0.8155072552303461,0.5875000000000004,-0.8660254037844384,0.5000000000000004C-0.9165435523385307,0.4125000000000005,-0.9165435523385312,-0.41249999999999926,-0.866025403784439,-0.4999999999999993C-0.8155072552303468,-0.5874999999999992,-0.10103629710818451,-1,0,-1C0.10103629710818451,-1,0.8155072552303464,-0.5875000000000001,0.8660254037844386,-0.5000000000000001" style="fill: none; stroke-opacity: 1; stroke-width: 0.12px;" transform="scale(0.5)"></path>
					<circle class="node-center-dot" r="0.1" stroke-width="0.005" class="_BaseShape__NodeAnchor-sc-1l8ddg7-0 kalpKK"></circle>
				</g>
			</g>
		</g>
	`;
	return node;
}

function EventNode({ x, y, scale, label, type }) {
	const node = createSVGElement('g');
	node.classList.add('node');
	node.innerHTML = `
		<g transform="translate(${x},${y}) scale(${scale})" draggable="false">
			<circle cx="5" cy="5" r="5" fill="${type && type === "trigger" ? 'red' : '#999'}" />
			<text fill="#ccc" font-size="12" font-family="Sans-serif" text-anchor="middle" x="5" y="30" xml:space="preserve" >${label}</text>
		</g>
	`;
	return node;
}

function circleLayout({
	radius = 100,
	width, height,
	numberOfItems,
	itemHeight, itemWidth,
	verticalScale = 1
}) {
	let angle = Math.PI / -2;
	const step = (2 * Math.PI) / numberOfItems;
	const positions = [];
	const distance = ([x1, y1], [x2, y2]) => Math.hypot(x2 - x1, y2 - y1);
	for (var i = 0; i < numberOfItems; i++) {
		var x1 = Math.round(width / 2 + radius * Math.cos(angle) - itemWidth / 2);
		var y1 = Math.round((height / 2 + (verticalScale * radius) * Math.sin(angle) - itemHeight / 2));
		positions.push([x1, y1]);
		angle += step;
	}
	if (verticalScale === 1) return positions;

	const first = 0;
	const last = positions.length - 1;
	const minDistance = 500;
	const adjustDistance = 150;
	for (var i = 0; i < positions.length; i++) {
		if (i <= positions.length / 2) {
			const previous = i === first
				? positions[last]
				: positions[i - 1];
			const prevDistance = distance(positions[i], previous);
			if (prevDistance < minDistance) {
				positions[i][1] += adjustDistance;
			}
			continue;
		}
		const next = i === last
			? positions[first]
			: positions[i + 1];
		const nextDistance = distance(positions[i], next);
		if (nextDistance < minDistance) {
			positions[i][1] += adjustDistance;
		}
	}
	return positions;
}


function addLinks({ canvas, allNodes }) {
	const createLine = ({ source, target }) => {
		const line = createSVGElement('g');
		line.innerHTML = `
			<line
				draggable="false"
				class="trigger-link"
				stroke-width="1"
				stroke-dasharray="2,2"
				x1="${source.x1}" x2="${target.x1}"
				y1="${source.y1}" y2="${target.y1}"
			/>
		`;
		canvas.appendChild(line);

		const lineEl = line.querySelector('line');
		line.adjust = ({ parent, diff }) => {
			if(![
				source.parent, target.parent
			].includes(parent)) return;

			if(parent === source.parent){
				lineEl.setAttribute('x1', source.x1 + Number(diff.x));
				lineEl.setAttribute('y1', source.y1 + Number(diff.y));
			}
			if(parent === target.parent){
				lineEl.setAttribute('x2', target.x1 + Number(diff.x));
				lineEl.setAttribute('y2', target.y1 + Number(diff.y));
			}
		}

		return { source, target, line };
	};
	const triggers = allNodes.filter(x => x.type === 'trigger');
	const targets = allNodes.filter(x => x.type !== 'trigger');
	let allLines = [];
	for (let t = 0; t < triggers.length; t++) {
		const trigger = triggers[t];
		const connections = targets.filter(target => target.label === trigger.label)
		const theseLines = connections.map(conn => createLine({
			target: conn,
			source: trigger,
			x: trigger.x1,
			y: trigger.y1,
			x1: conn.x1,
			y1: conn.y1,
		}));
		allLines = [ ...allLines, ...theseLines];
	}
	return allLines;
}

// this adds all child nodes
function addNodes(canvas, { x, y }, nodes = [], parent) {
	const layout = circleLayout({
		radius: 100,
		width: x,
		height: y,
		itemHeight: 0,
		itemWidth: 50,
		numberOfItems: nodes.length,
	});

	const _nodes = [];
	for (var i = 0, len = nodes.length; i < len; i++) {
		const [x1, y1] = layout[i];
		const line = createSVGElement('g');
		const isTrigger = nodes[i] && nodes[i].type === "trigger"
		line.innerHTML = `
			<line
				stroke="${isTrigger ? "red" : "#888"}"
				stroke-width="1"
				stroke-dasharray="2,2"
				x1="${x1 + 5}" x2="${x / 2 - 20}"
				y1="${y1 + 5}" y2="${y / 2 + 5}"
			/>
		`;
		if(parent){
			parent.appendChild(line);
		} else {
			canvas.appendChild(line);
		}
		_nodes.push({
			x: x / 2 - 20,
			y: y / 2 + 5,
			x1: x1 + 5,
			y1: y1 + 5,
			scale: 1,
			label: nodes[i].key || nodes[i],
			type: nodes[i].type
		});

		const nodeParams = {
			x: x1, y: y1,
			scale: 1,
			label: nodes[i].key || nodes[i],
			type: nodes[i].type
		};
		const node = EventNode(nodeParams);

		if(parent){
			parent.appendChild(node);
		} else {
			canvas.appendChild(node);
		}
	}
	return _nodes;
}

function makeDraggable(el){
  if (!el) return console.error('makeDraggable() needs an element');
  var svg = el;
  while (svg && svg.tagName!='svg') svg=svg.parentNode;
  if (!svg) return console.error(el,'must be inside an SVG wrapper');
  var pt=svg.createSVGPoint(), doc=svg.ownerDocument;

  var root = doc.rootElement || doc.body || svg;
  var xlate, txStartX, txStartY, mouseStart;
  var xforms = el.transform.baseVal;

  el.addEventListener('mousedown',startMove,true);

  function startMove(evt){
    root.addEventListener('mousemove',handleMove,false);
    root.addEventListener('mouseup',  finishMove,false);
    xlate = xforms.numberOfItems>0 && xforms.getItem(0);
    if (!xlate || xlate.type != SVGTransform.SVG_TRANSFORM_TRANSLATE){
      xlate = xforms.createSVGTransformFromMatrix( svg.createSVGMatrix() );
      xforms.insertItemBefore( xlate, 0 );
    }
    txStartX=xlate.matrix.e;
    txStartY=xlate.matrix.f;
    mouseStart = inElementSpace(evt);
		//fireEvent('synthetic-dragstart');
		evt.preventDefault();
		return false;
  }
  function handleMove(evt){
    var point = inElementSpace(evt);
    xlate.setTranslate(
      txStartX + point.x - mouseStart.x,
      txStartY + point.y - mouseStart.y
    );
		fireEvent('synthetic-drag');
		evt.preventDefault();
		return false;
  }
  function finishMove(evt){
    root.removeEventListener('mousemove',handleMove,false);
    root.removeEventListener('mouseup',  finishMove,false);
    //fireEvent('synthetic-dragend');
  }
  function fireEvent(eventName){
    var event = new Event(eventName);
    event.detail = { x:xlate.matrix.e, y:xlate.matrix.f };
    return el.dispatchEvent(event);
  }
  function inElementSpace(evt){
    pt.x=evt.clientX; pt.y=evt.clientY;
    return pt.matrixTransform(el.parentNode.getScreenCTM().inverse());
  }
}

function drawRootNodes({ canvas, listeners, triggers }) {
	let keys = Object.keys(listeners)
		.sort((a, b) => listeners[a].length - listeners[b].length)
		.reverse();

	let rippled = [];
	const isOddLength = keys.length % 2;
	let popped;
	for (let k = 0; k < keys.length; k++) {
		if (!popped && isOddLength && (k * 2) > (keys.length / 2)) {
			popped = rippled.pop();
		}
		if (!rippled.includes(keys[k])) {
			rippled.push(keys[k]);
		}
		if (!rippled.includes(keys[keys.length - k - 1])) {
			rippled.push(keys[keys.length - k - 1]);
		}
	}
	keys = rippled;

	const layout = circleLayout({
		radius: 1200,
		width: 4000,
		height: 4000,
		itemHeight: 0,
		itemWidth: 0,
		numberOfItems: keys.length,
		verticalScale: 0.5
	});
	let allNodes = [];
	let allLinks;
	for (var i = 0, len = keys.length; i < len; i++) {
		const [x, y] = layout[i];
		const children = [
			...listeners[keys[i]],
			...(triggers[keys[i]] || [])
				.map(key => ({ key, type: 'trigger' }))
		];
		const nodeParams = { x: x / 2 - 20, y: y / 2 + 5, scale: 0.9, label: keys[i] };
		if (children.length === 1 || children.length === 3) {
			nodeParams.labelDistance = 100;
		}
		const node = Node(nodeParams);
		node.classList.add('node-group');

		const theseNodes = addNodes(
			canvas,
			{ x, y },
			rotateArray(children, (360 * i / keys.length) - 155),
			node
		);
		allNodes = [
			...theseNodes.map(x => ({ ...x, parent: keys[i] })),
			...allNodes
		];

		canvas.appendChild(node);
		makeDraggable(node);
		svgChildBringToTop(node.querySelector('g'));
		let nodeName = keys[i];
		let myLinks;
		node.addEventListener('synthetic-drag', ({detail}) => {
			myLinks = myLinks || allLinks
				.filter(x => x.source.parent === nodeName || x.target.parent === nodeName)
			myLinks.forEach(m => m.line.adjust({
				parent: nodeName,
				diff: detail
			}))
		});
	}

	allLinks = addLinks({ canvas, allNodes });
}


function getServiceSelector(el, onSelect) {
	const style = `
		<style>
			.row.selector {
				position: absolute;
				left: -60px; /* because contents don't feel centered otherwise*/
				left: 0px;
				right: 0;
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				align-items: center;
				z-index: 999;
				opacity: .095;
			}
			.row.selector:hover {
				opacity: 1;
			}
			.selector .select-wrapper {
				background: var(--theme-subdued-color);
				border-radius: 5px;
				z-index: 1;
			}
			.selector input.select-dropdown.dropdown-trigger {
				padding-left: 15px;
				padding-right: 30px;
				box-sizing: border-box;
				border: 1px solid;
				border-radius: 5px;
				color: var(--main-theme-text-invert-color);
				height: 2.5rem;
			}
			.selector .select-wrapper .caret {
				fill: var(--main-theme-text-invert-color);
				right: 7px;
			}
			input.select-dropdown.dropdown-trigger, .dropdown-content li span {
					font-size: small;
			}
			.dropdown-content {
				background-color: var(--theme-subdued-color);
				border: 1px solid var(--main-theme-text-invert-color);
				border-radius: 5px;
				color: var(--main-theme-text-color);
			}
			.dropdown-content li span {
				background: transparent;
				color: var(--main-theme-text-invert-color);
			}
			.dropdown-content span:hover {
				background: transparent;
				color: white;
			}
			#canvas text,
			#canvas foreignObject {
				pointer-events: none;
				user-select: none;
			}
		</style>`;

		el.innerHTML = style + `
		<div class="input-field s3">
			<select>
				<option value="ui-service">UI Service Map</option>
				<option value="system-services">System Service Map</option>
			</select>
		</div>
	`;
	const select = el.querySelector('select');
	if (!window.M) {
		console.error('could not build service map selector dropdown');
		return;
	}
	const selectInstance = M.FormSelect.init(select, {
		//classes: 'grey darken-3',
		dropdownOptions: {
			inDuration: 0, outDuration: 0,
			onCloseEnd: (e) => {
				const parent = document.querySelector('.selector ul.select-dropdown');
				const selected = parent && document.querySelector('.selector ul.select-dropdown li.selected');
				const items = selected && Array.from(
					document.querySelectorAll('.selector ul.select-dropdown li')
				);
				if (items && items.length > 1 & items[0].id !== selected.id) {
					parent.insertBefore(selected, items[0]);
				}
				onSelect(select.value);
			}
		}
	});
	return selectInstance;
}

function getZoomControls(el, zoomTarget){
	const style = `
		<style>

			.zoom-controls {
				position: absolute;
				right: 60px;
				bottom: 8px;
				width: 1em;
				height: 2.25em;
				font-size: 3.25em;
				background: #2f2f2fe8;
				border-radius: 19px;
				text-align: center;
				color: #999999;
				z-index: 1;
				border: 1px solid #232323;
				opacity: .3;
				display: flex;
				flex-direction: column;
				justify-content: space-evenly;
				align-items: center;
			}
			.zoom-controls:hover {
				opacity: 1;
			}
			.zoom-controls span {
				height: 35px;
				display: flex;
				border-radius: 50%;
				background: #333333;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				font-family: monospace;
			}
			.zoom-plus:before {
				content: '+';
			}
			.zoom-minus:before {
				content: '-';
			}
		</style>
	`;
	el.innerHTML = style + `
		<span class="zoom-plus"></span>
		<span class="zoom-minus"></span>
	`;
	el.querySelector('.zoom-plus').onclick = () => {
		const zoom = localStorage.getItem('serviceMapZoom') || 1;
		zoomTarget.style.transform = modifyTransform(zoomTarget, 'scale', Number(zoom) + 0.1);
		localStorage.setItem('serviceMapZoom', Number(zoom) + 0.1);
	}
	el.querySelector('.zoom-minus').onclick = () => {
		const zoom = localStorage.getItem('serviceMapZoom') || 1;
		zoomTarget.style.transform = modifyTransform(zoomTarget, 'scale', Number(zoom) - 0.1);
		localStorage.setItem('serviceMapZoom', Number(zoom) - 0.1);
	}
}

const handleSelect = (selection, canvas, {
	getListeners, getTriggers, getCurrentServices
} = {}) => {
	const showUIServices = () => {
		const mapToNodes = (list) => list
			.reduce((all, one) => {
				const eventName = one.split('__')[0];
				const name = one.split('__')[1];
				all[name] = all[name] || [];
				all[name].push(eventName);
				return all;
			}, {});
		const listeners = mapToNodes(getListeners());
		const triggers = mapToNodes(getTriggers());
		drawRootNodes({ canvas, listeners, triggers });
	}

	const showSystemServices = async () => {
		const services = await getCurrentServices();
		const layout = circleLayout({
			radius: 200,
			width: 2000,
			height: 2000,
			itemHeight: 0,
			itemWidth: 0,
			numberOfItems: services.length,
			verticalScale: 1
		});
		services && services.forEach((s, i) => {
			const [x, y] = layout[i];
			const node = Node({
				x, y, scale: 1,
				label: s.name,
				labelDistance: 50
			});
			canvas.appendChild(node);
		});
	};

	const cleanCanvas = () => {
		const allGroups = Array.from(canvas.querySelectorAll('g'))
			.forEach(g => {
				g.parentNode.removeChild(g);
			})
	};

	if (selection === 'ui-service') {
		cleanCanvas();
		showUIServices();
	}
	if (selection === 'system-services') {
		cleanCanvas();
		showSystemServices();
	}
};

let services;
let currentServices;
function Services({ list } = {}) {
	if (services) {
		return;
	}
	const getCurrentServices = async () => {
		//TODO: this is lame, replace it later
		currentServices = currentServices && currentServices.length
			? currentServices
			: (await (await fetch('./service/read/*')).json()).result;
		return currentServices;
	};
	services = document.getElementById('services');
	//services.classList.add('hidden');
	//document.querySelector('#terminal').style.visibility = "hidden";
	services.style.width = "100%";
	services.style.height = "100%";
	services.innerHTML = `
		${styles}
		<div class="row selector"></div>
		<div class="zoom-controls"></div>

		<svg id="canvas" class="" draggable="false">
			<!-- circle cx="${services.offsetWidth / 2}" cy="${services.offsetHeight / 2}" r="2.5" fill="red"
			/ -->
		</svg>
	`;
	const canvas = services.querySelector('svg#canvas');

	if (!canvas) { return; }

	const selector = services.querySelector('#services .selector');
	const onSelect = (val) => {
		handleSelect(val, canvas, {
			getCurrentServices,
			getListeners: window.listListeners,
			getTriggers: window.listTriggers,
		});
	};
	getServiceSelector(selector, onSelect);

	const zoomControls = services.querySelector('#services .zoom-controls');
	const zoomTarget = services.querySelector('#services #canvas');
	getZoomControls(zoomControls, zoomTarget);

	setTimeout(x => {
		onSelect('ui-service');
	}, 2000);


	attachListener({
		showServiceMap: () => services.classList.remove('hidden'),
		hideServiceMap: () => services.classList.add('hidden'),
		receiveServices: (services) => {
			currentServices = services;
			onSelect('ui-service');
		}
	});

	attachPan(canvas);
}

export default Services;
