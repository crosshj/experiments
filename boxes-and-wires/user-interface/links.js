import { setStyle, removeStyle, bringToTop } from './utils.js';

function getLinkDirections(link) {
	const dirs = {
		start: '',
		end: ''
	};
	Object.keys(dirs).forEach(cap => {
		const el = link[cap];
		const direction = el.getAttribute('data-direction');
		if (cap === 'start') {
			dirs.start = direction;
			return;
		}
		dirs.end = direction;
	});
	return dirs;
}

function calculateControls(p) {
	const xDifference = p.c3.x - p.m.x;
	const yDifference = p.c3.y - p.m.y;

	const xMult = xDifference < 0
		? -2
		: 0.5;
	const yMult = 0;

	const yCurve = Math.abs(xDifference) < 20
		? 150 * (Math.abs(xDifference) / 20)
		: 100;
	const yOffset = xDifference < 0
		? yDifference < 0 ? -yCurve : yCurve
		: 0
	const controls = {
		c1: {
			x: p.m.x + (xDifference * xMult),
			y: p.m.y + (yDifference * yMult) + yOffset
		},
		c2: {
			x: p.c3.x - (xDifference * xMult),
			y: p.c3.y - (yDifference * yMult) - yOffset
		}
	};
	return controls;
}

function drawControls({ namespaceURI, link, linkElement, pathObj }) {
	if (!link.controlLine1) {
		link.controlLine1 = document.createElementNS(namespaceURI, "line");
		link.controlLine1.classList.add('control');
		linkElement.appendChild(link.controlLine1);
	}
	if (!link.controlLine2) {
		link.controlLine2 = document.createElementNS(namespaceURI, "line");
		link.controlLine2.classList.add('control');
		linkElement.appendChild(link.controlLine2);
	}
	if (!link.controlLine3) {
		link.controlLine3 = document.createElementNS(namespaceURI, "line");
		link.controlLine3.classList.add('control');
		linkElement.appendChild(link.controlLine3);
	}
	const controlCircleRadius = 3;
	if (!link.controlCircle1) {
		link.controlCircle1 = document.createElementNS(namespaceURI, "circle");
		link.controlCircle1.classList.add('control-circle');
		link.controlCircle1.setAttribute('r', controlCircleRadius);
		linkElement.appendChild(link.controlCircle1);
	}
	if (!link.controlCircle2) {
		link.controlCircle2 = document.createElementNS(namespaceURI, "circle");
		link.controlCircle2.classList.add('control-circle');
		link.controlCircle2.setAttribute('r', controlCircleRadius);
		linkElement.appendChild(link.controlCircle2);
	}

	link.controlCircle1.setAttribute('cx', pathObj.c1.x);
	link.controlCircle1.setAttribute('cy', pathObj.c1.y);
	link.controlCircle2.setAttribute('cx', pathObj.c2.x);
	link.controlCircle2.setAttribute('cy', pathObj.c2.y);

	link.controlLine1.setAttribute('x1', pathObj.m.x);
	link.controlLine1.setAttribute('y1', pathObj.m.y);
	link.controlLine1.setAttribute('x2', pathObj.c1.x);
	link.controlLine1.setAttribute('y2', pathObj.c1.y);

	link.controlLine2.classList.add('control');
	link.controlLine2.setAttribute('x1', pathObj.c1.x);
	link.controlLine2.setAttribute('y1', pathObj.c1.y);
	link.controlLine2.setAttribute('x2', pathObj.c2.x);
	link.controlLine2.setAttribute('y2', pathObj.c2.y);

	link.controlLine3.classList.add('control');
	link.controlLine3.setAttribute('x1', pathObj.c2.x);
	link.controlLine3.setAttribute('y1', pathObj.c2.y);
	link.controlLine3.setAttribute('x2', pathObj.c3.x);
	link.controlLine3.setAttribute('y2', pathObj.c3.y);
}

function pathDToObj(pathD) {
	const matches = pathD
		.split(' ')
		.map(Number)
		.filter(x => !isNaN(x));
	return {
		m: {
			x: matches[0],
			y: matches[1]
		},
		c1: {
			x: matches[2],
			y: matches[3]
		},
		c2: {
			x: matches[4],
			y: matches[5]
		},
		c3: {
			x: matches[6],
			y: matches[7]
		}
	};
}

function objToPathD(o, directions) {
	var start = `M ${o.m.x} ${o.m.y}`;
	var end = `${o.c3.x} ${o.c3.y}`;
	if (!directions) {
		return `${start} C ${o.c1.x} ${o.c1.y} ${o.c2.x} ${o.c2.y} ${end}`;
	}

	const offset = 7;
	const segmentsStart = {
		'north': `L ${o.m.x} ${o.m.y - offset}`,
		'east': `L ${o.m.x + offset} ${o.m.y}`,
		'south': `L ${o.m.x} ${o.m.y + offset}`,
		'west': `L ${o.m.x - offset} ${o.m.y}`
	};
	if (directions.start && segmentsStart[directions.start]) {
		start += ` ${segmentsStart[directions.start]}`;
	}
	const segmentsEnd = {
		'north': `${o.c3.x} ${o.c3.y - offset} L ${o.c3.x} ${o.c3.y}`,
		'east': `${o.c3.x + offset} ${o.c3.y} L ${o.c3.x} ${o.c3.y}`,
		'south': `${o.c3.x} ${o.c3.y + offset} L ${o.c3.x} ${o.c3.y}`,
		'west': `${o.c3.x - offset} ${o.c3.y} L ${o.c3.x} ${o.c3.y}`
	};
	if (directions.end && segmentsEnd[directions.end]) {
		end = segmentsEnd[directions.end];
	}

	return `${start} L ${end}`;
}

function removeAnimation() {
	Array.from(document.querySelectorAll('path.animated')).forEach(path => {
		path.parentNode.removeChild(path);
	});
	removeStyle('linkAnimation');
}

function createLinkElement(link) {
	const namespaceURI = document.getElementById('canvas').namespaceURI;
	const linkElement = document.createElementNS(namespaceURI, "g");
	linkElement.classList.add('link');

	const linkPath = document.createElementNS(namespaceURI, "path");

	const startCoords = link.start;
	const endCoords = link.end;
	const pathObj = {
		m: startCoords,
		c3: endCoords
	};
	const controls = calculateControls(pathObj);
	pathObj.c1 = controls.c1;
	pathObj.c2 = controls.c2;
	const directions = {
		start: link.start.direction,
		end: link.end.direction
	};
	const originalPathD = objToPathD(pathObj, directions);
	linkPath.setAttribute('d', originalPathD)

	linkElement.appendChild(linkPath);

	//drawControls({ namespaceURI, link, linkElement, pathObj });

	const linksGroup = document.querySelector('#canvas #links');
	linksGroup.appendChild(linkElement);

	return linkElement;
}

// -----------------------------------------------------------------------------

export function animateLink(link, callback, reverse) {
	//TODO: also animate node and helper
	//NOTE: would be nice if link wire, node, and helpers could be treated as one
	const linkQuery = `.link[data-label="${link.label}"]`;
	const linkElement = document.querySelector(linkQuery);
	const linkPath = document.querySelector(`${linkQuery} path`);

	const namespaceURI = document.getElementById('canvas').namespaceURI;
	const animatedPath = document.createElementNS(namespaceURI, 'path');
	animatedPath.classList.add('animated');
	animatedPath.setAttribute('d', linkPath.getAttribute('d'));
	linkElement.appendChild(animatedPath);

	const linkLength = linkPath.getTotalLength();
	const dashLength = 1;
	const duration = linkLength / 100 * 2.5;
	const style = `
		${linkQuery} path.animated {
				/* stroke: #fff9; */
				stroke-linecap: round;
				stroke-width: 7px;
				stroke-dasharray: ${dashLength} ${linkLength};
				animation-name: dash-${link.label};
				animation-duration: ${duration}s; /* or: Xms */
				animation-iteration-count: 1;
				animation-direction: ${reverse ? 'reverse' : 'normal'}; /* or: normal */
				animation-timing-function: linear; /* or: ease, ease-in, ease-in-out, linear, cubic-bezier(x1, y1, x2, y2) */
				animation-fill-mode: both; /* or: backwards, both, none */
				animation-delay: 0s; /* or: Xms */
		}

		@keyframes dash-${link.label} {
				from {
						stroke-dashoffset: ${dashLength};
				}
				to {
						stroke-dashoffset: ${-linkLength};
				}
		}
	`;
	var isPaused;
	const timeoutDone = () => {
		if (isPaused) {
			return;
		}
		callback && callback();
	};
	setTimeout(timeoutDone, duration * 1000);
	setStyle('linkAnimation', style)

	function pause() {
		if (isPaused) {
			return;
		}
		isPaused = true;
		animatedPath.style.animationPlayState = 'paused';
		animatedPath.style.webkitAnimationPlayState = 'paused';
	}
	function resume() {
		if (!isPaused) {
			return;
		}
		isPaused = false;
		setTimeout(timeoutDone, duration * 1000);
		animatedPath.style.animationPlayState = 'running';
		animatedPath.style.webkitAnimationPlayState = 'running';
	}
	function pauseHard() {
		isPaused = true;
		callback('reset');
		removeAnimation();
	}
	function resumeHard() {
		removeAnimation();
		callback('reset');
		setTimeout(() => animateLink(link, callback), 500);
	}
	return { pause, resume, pauseHard, resumeHard };
}

export function drawLink(link, callback) {
	var linkElement = document.querySelector(`g[data-label="${link.label}"]`);
	const linkStartParent = document.querySelector(
		`.box[data-label="${link.start.parent.block}"] .node[data-label="${link.start.parent.node}"]`
	);
	const linkEndParent = document.querySelector(
		`.box[data-label="${link.end.parent.block}"] .node[data-label="${link.end.parent.node}"]`
	);

	const linkStartParentHelper = document.querySelector(
		`.box[data-label="${link.start.parent.block}"] .helpers [data-label="${link.start.parent.node}"]`
	);

	const linkEndParentHelper = document.querySelector(
		`.box[data-label="${link.end.parent.block}"] .helpers [data-label="${link.end.parent.node}"]`
	);

	// don't draw (or remove) link if it doesn't have 2 connections
	if (!linkStartParent || !linkEndParent) {
		if (!linkElement) return;
		linkElement.parentNode.removeChild(linkElement);
	}

	if (!linkElement) {
		linkElement = createLinkElement(link);
		linkElement.setAttribute('data-label', link.label);
	}
	const pathObj = {
		m: {
			x: link.start.x,
			y: link.start.y
		},
		c3: {
			x: link.end.x,
			y: link.end.y
		}
	};

	const controlPoints = calculateControls(pathObj);
	pathObj.c1 = controlPoints.c1;
	pathObj.c2 = controlPoints.c2;
	const directions = {
		start: link.start.direction,
		end: link.end.direction
	};
	const newPathD = objToPathD(pathObj, directions);
	linkElement.querySelector('path').setAttribute('d', newPathD);
	//NOTE: filter on a thin, vertical element is buggy (so pulse is commented for now)
	if (link.selected) {
		linkElement.classList.add('selected');
		linkStartParent.classList.add('selected');
		linkEndParent.classList.add('selected');
		linkStartParentHelper.classList.add('selected');
		linkEndParentHelper.classList.add('selected');
		//linkElement.classList.add('pulse');
	} else {
		linkElement.classList.remove('selected');
		linkStartParent.classList.remove('selected');
		linkEndParent.classList.remove('selected');
		linkStartParentHelper.classList.remove('selected');
		linkEndParentHelper.classList.remove('selected');
		//linkElement.classList.remove('pulse');
	}

	const animated = linkElement.querySelector('path.animated');
	animated && animated.setAttribute('d', newPathD);
	callback && callback(linkElement);
}

export function addLinkEffects(state) {
	var svg = state.svg;
	const hoverStartHandler = hoverStart.bind(state);
	const hoverEndHandler = hoverEnd.bind(state);
	const clickHandler = linkClick.bind(state);
	svg.addEventListener("mouseover", hoverStartHandler);
	svg.addEventListener('mouseout', hoverEndHandler);
	svg.addEventListener('mouseleave', hoverEndHandler);
	svg.addEventListener('click', clickHandler);
}