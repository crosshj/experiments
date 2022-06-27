import { setStyle, removeStyle, bringToTop } from './utils.js';

function getMousePosition(svg, evt) {
	var CTM = svg.getScreenCTM();
	if (evt.touches) { evt = evt.touches[0]; }
	return {
		x: (evt.clientX - CTM.e) / CTM.a,
		y: (evt.clientY - CTM.f) / CTM.d
	};
}

function initialiseUnitDragging(svg, selectedElement, evt) {
	const offset = getMousePosition(svg, evt);

	// Make sure the first transform on the element is a translate transform
	var transforms = selectedElement.transform.baseVal;
	if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
		// Create an transform that translates by (0, 0)
		var translate = svg.createSVGTransform();
		translate.setTranslate(0, 0);
		selectedElement.transform.baseVal.insertItemBefore(translate, 0);
	}

	// Get initial translation
	const transform = transforms.getItem(0);
	offset.x -= transform.matrix.e;
	offset.y -= transform.matrix.f;
	return { transform, offset };
}

function initialiseWireDragging(evt) {
	const mousePos = getMousePosition(this.svg, evt);
	const label = Math.random().toString(26).replace('0.', '');

	const startDirection = evt.target.dataset.direction;
	const endDirection = oppositeDirection[startDirection];

	const tempUnit = {
		x: mousePos.x,
		y: mousePos.y,
		label,
		width: 10,
		height: 10,
		temporary: true,
		nodes: [{
			x: 0,
			y: 0,
			direction: endDirection,
			label: 'first'
		}]
	};

	const linkLabel = Math.random().toString(26).replace('0.', '');
	const tempLink = {
		temporary: true,
		label: linkLabel,
		start: {
			direction: startDirection,
			parent: {
				block: evt.target.parentNode.dataset.label,
				node: evt.target.dataset.label
			},
			x: getTranslateX(evt.target.parentNode) + Number(evt.target.getAttribute('cx')),
			y: getTranslateY(evt.target.parentNode) + Number(evt.target.getAttribute('cy'))
		},
		end: {
			direction: endDirection,
			parent: {
				block: tempUnit.label,
				node: tempUnit.nodes[0].label
			},
			x: mousePos.x,
			y: mousePos.y
		}
	};
	tempLink.temporary = true;

	const setDraggingState = (unitElement, linkElement) => {
		if (!unitElement || !linkElement) {
			debugger;
		}
		this.selectedElement = unitElement;
		const initD = initialiseUnitDragging(this.svg, unitElement, evt);
		this.transform = initD.transform;
		this.offset = initD.offset;
		this.draggedUnit = unitElement;
		this.draggedLink = linkElement;
		this.update((state) => {
			const newUnits = state.units.concat([tempUnit]);
			const newLinks = state.links.concat([tempLink]);
			return { units: newUnits, links: newLinks };
		});
	}

	const initWireDragTasks = () => {
		drawOrUpdateUnit(tempUnit, (unitElement) => {
			drawLink(tempLink, (linkElement) => {
				setDraggingState(unitElement, linkElement);
			});
		});
	};
	withAnimFrame(initWireDragTasks)();
}

function distanceNodes(node1, node2) {
	var a = node1.x - node2.x;
	var b = node1.y - node2.y;

	var c = Math.sqrt(a * a + b * b);
	return c;
}

// ---------------------------------------------------------------

function startDrag(evt) {
	if (this.selectedElement) {
		return;
	}

	const nodeDrag = {
		test: () => evt.target.classList.contains('node'),
		start: () => {
			initialiseWireDragging.bind(this)(evt);
		}
	};
	const groupDrag = {
		test: () => evt.target.parentNode.classList.contains('draggable-group'),
		start: () => {
			this.selectedElement = evt.target.parentNode;
			bringToTop(this.selectedElement);
			const initD = initialiseUnitDragging(this.svg, this.selectedElement, evt);
			this.transform = initD.transform;
			this.offset = initD.offset;
		}
	};

	const dragMode = [
		nodeDrag, groupDrag
	].filter(x => {
		try {
			return x.test();
		} catch (e) {
			return false;
		}
	})[0];

	if (dragMode) {
		setStyle('clearBox', `
				.box {
						opacity: 0.7;
				}
				path.animated {
						opacity: 0.5 !important;
				}
		`);
		dragMode.start();
		window.pause && window.pause();
	}

	evt.stopPropagation();
	evt.preventDefault();
}

function drag(evt) {
	if (!this.selectedElement) {
		return;
	}
	evt.preventDefault();
	evt.stopPropagation();

	var coord = getMousePosition(this.svg, evt);
	state.update((state) => {
		const selectedUnitState = state.units.find(u => u.label === this.selectedElement.dataset.label);
		selectedUnitState.x = coord.x - this.offset.x;
		selectedUnitState.y = coord.y - this.offset.y;

		state.links.forEach(link => {
			['start', 'end'].forEach(connect => {
				const connection = link[connect];
				if (connection.parent.block !== selectedUnitState.label) {
					return;
				}
				const connectedNode = selectedUnitState.nodes
					.find(n => n && n.label === connection.parent.node);
				connection.x = selectedUnitState.x + connectedNode.x;
				connection.y = selectedUnitState.y + connectedNode.y;
			});
		});
		return state;
	});
}

function endDrag(evt) {
	if (!this.selectedElement) {
		return;
	}
	removeStyle('clearBox');

	const dragged = {
		element: this.selectedElement,
		link: this.draggedLink,
		unit: this.draggedUnit,
		temporary: this.selectedElement.dataset.temporary
	};
	if (dragged.temporary) {
		const mousePos = getMousePosition(this.svg, evt);
		const currentState = this.read();
		const allNodes = currentState.units
			.filter(x => x.label !== dragged.unit.dataset.label)
			.reduce((all, one) => {
				const nodes = one.nodes.map(x => {
					if (!x) {
						return x;
					}
					const globalPosition = () => {
						return {
							x: one.x + x.x,
							y: one.y + x.y
						};
					};
					const parentLabel = one.label;
					return Object.assign({}, x, { globalPosition, parentLabel });
				});
				return all.concat(nodes)
			}, [])
			.filter(x => !!x)
			.map(n => ({
				label: n.label,
				parentLabel: n.parentLabel,
				direction: n.direction,
				x: n.x,
				y: n.y,
				globalX: n.globalPosition().x,
				globalY: n.globalPosition().y,
				distance: distanceNodes({
					x: mousePos.x,
					y: mousePos.y,
				}, {
						x: n.globalPosition().x,
						y: n.globalPosition().y,
					})
			}))
			.filter(n => n.distance < 10)
			.sort((a, b) => a.distance - b.distance);
		if (!allNodes.length) {
			const units = currentState.units.filter(u => !u.temporary);
			const links = currentState.links.filter(l => !l.temporary);

			this.update(() => {
				return { units, links };
			});
			this.selectedElement = undefined;
			evt.preventDefault();
			evt.stopPropagation();
			return;
		}
		const units = currentState.units.filter(u => !u.temporary);
		const links = currentState.links;
		const draggingLink = links.find(l => l.temporary);
		const newEnd = allNodes[0];
		delete draggingLink.temporary;
		draggingLink.end.parent.block = newEnd.parentLabel;
		draggingLink.end.parent.node = newEnd.label;
		draggingLink.end.parent.direction = oppositeDirection[newEnd.direction];
		this.update(() => {
			return { units, links };
		})
	}
	window.resume && window.resume();
	this.selectedElement = undefined;
	evt.preventDefault();
	evt.stopPropagation();
}

export function makeDraggable(state) {
	var svg = state.svg;

	const startDragHandler = startDrag.bind(state);
	svg.addEventListener('mousedown', startDragHandler);
	svg.addEventListener('touchstart', startDragHandler, { passive: false });

	const dragHandler = drag.bind(state);
	svg.addEventListener('touchmove', dragHandler, { passive: false });
	svg.addEventListener('mousemove', dragHandler);

	const endDragHandler = endDrag.bind(state);
	svg.addEventListener('mouseup', endDragHandler);
	svg.addEventListener('mouseleave', endDragHandler);
	svg.addEventListener('touchend', endDragHandler);
	svg.addEventListener('touchleave', endDragHandler);
	svg.addEventListener('touchcancel', endDragHandler);
}
