const oppositeDirection = {
	north: 'south',
	south: 'north',
	east: 'west',
	west: 'east'
};

function getNodeDirection(node) {
	const el = node;
	const cx = Number(el.getAttribute('cx'));
	const cy = Number(el.getAttribute('cy'));
	const rect = el.parentNode.querySelector('rect');
	const width = Number(rect.getAttribute('width'));
	const height = Number(rect.getAttribute('height'));

	if (cx >= width) { return 'east'; }
	if (cy + 5 >= height) { return 'south'; }
	if (cx - 15 <= 0) { return 'west'; }
	return 'north';
}

export function drawOrUpdateUnit(unit, callback) {
	const unitElement = document.querySelector(`.box[data-label="${unit.label}"]`);

	if (!unitElement) {
		drawUnit(unit, callback);
		return;
	}

	unitElement.setAttribute('class', 'box draggable-group' + (unit.class ? ` ${unit.class}` : ''));
	unitElement.setAttribute('transform', `translate(${unit.x} , ${unit.y})`);
}

export function drawUnit(unit, callback) {
	const width = Number(unit.width || 76);
	const height = Number(unit.height) || 76;

	const namespaceURI = document.getElementById('canvas').namespaceURI;
	const unitElement = document.createElementNS(namespaceURI, "g");
	unit.temporary && unitElement.setAttribute('data-temporary', true);
	unitElement.setAttribute('data-label', unit.label);
	unitElement.setAttribute('class', 'box draggable-group' + (unit.class ? ` ${unit.class}` : ''));
	unitElement.setAttribute('transform', `translate(${unit.x} , ${unit.y})`);
	const style = unit.color
		? `fill:${unit.color}`
		: '';
	const overlayStyle = unit.color
		? `fill:${overlayColor(unit.color)}`
		: '';
	const rect = `<rect x="10" y="1" style="${style}" width="${width}" height="${height}" rx="0" ry="0"></rect>`;
	var unitElementHTML = unit.temporary
		? ''
		: `
			${rect}
			<text x="${width / 2 - unit.label.length * 2}" y="${height / 2 + 4}" style="${overlayStyle}" class="heavy">${unit.label}</text>
		`;
	const nodeRadius = 3;
	const offSet = 10;
	const insetNode = nodeRadius;
	const insetNodeLeft = insetNode + offSet;
	const canvas = document.querySelector('#canvas');
	unit.element = unitElement;

	if (unit.temporary) {
		unitElement.innerHTML = `
			<circle class="node dragging" data-label=${unit.nodes[0].label} cx="0" cy="0" r="3"></circle>
		`;
		canvas.appendChild(unitElement);
		if (callback) {
			callback(unitElement);
		}
		return;
	}

	var positions = [{
		x: insetNodeLeft, y: offSet //top-left
	}, {
		x: insetNodeLeft, y: height / 2 //middle-left
	}, {
		x: insetNodeLeft, y: height - offSet //bottom-left
	}, {
		x: offSet + width / 2, y: height - insetNode + 1 //bottom-middle
	}, {
		x: width - insetNode + offSet, y: offSet //top-right
	}, {
		x: width - insetNode + offSet, y: height / 2 //middle-right
	}, {
		x: width - insetNode + offSet, y: height - offSet //bottom-right
	}, {
		x: offSet + width / 2, y: offSet / 2 - 1 //top-middle
	}];

	unit.nodes.forEach(n => {
		if (!n) {
			positions.shift();
			return;
		}
		const pos = positions.shift();
		unitElementHTML += `
			<circle data-label="${n.label}" class="node" cx="${pos.x}" cy="${pos.y}" r="${nodeRadius}"></circle>
		`;
	});
	unitElementHTML += '<g class="helpers"></g>'
	unitElement.innerHTML = unitElementHTML;
	unit.nodes.forEach(n => {
		if (!n) return;
		n.element = unitElement.querySelector(`circle[data-label="${n.label}"]`);
		n.globalPosition = () => ({
			x: Number(n.element.getAttribute('cx')) + getTranslateX(n.element.parentNode),
			y: Number(n.element.getAttribute('cy')) + getTranslateY(n.element.parentNode),
		});
	});

	const helpers = unitElement.querySelector('.helpers');
	var helpersHTML = '';
	unit.nodes.forEach(n => {
		if (!n) return;
		const el = unitElement.querySelector(`circle[data-label="${n.label}"]`);
		if (n.selected) {
			el.classList.add('selected');
		}
		const direction = getNodeDirection(el);
		el.setAttribute('data-direction', getNodeDirection(el));
		const cx = Number(el.getAttribute('cx'));
		const cy = Number(el.getAttribute('cy'));
		const offset = 6; //length of helper
		const segment = {
			'north': `M ${cx} ${cy} L ${cx} ${cy - offset}`,
			'east': `M ${cx} ${cy} L ${cx + offset} ${cy}`,
			'south': `M ${cx} ${cy} L ${cx} ${cy + offset}`,
			'west': `M ${cx} ${cy} L ${cx - offset} ${cy}`
		};
		helpersHTML += `
			<path data-label="${n.label}" class="helper-segment${n.selected ? ' selected' : ''}" d="${segment[direction]}"></path>
		`;
	});

	helpers.innerHTML = helpersHTML;

	canvas.appendChild(unitElement);
	callback && callback(unitElement);
}

export function mapNodeToState(node, index) {
	if (!node) { return node; }
	const unit = this.unit;
	const width = Number(unit.width || 76);
	const height = Number(unit.height || 76);

	const directionMap = [
		'west', 'west', 'west',
		'south',
		'east', 'east', 'east',
		'north'
	];

	const nodeRadius = 3;
	const offSet = 10;
	const insetNode = nodeRadius;
	const insetNodeLeft = insetNode + offSet;

	var positions = [{
		x: insetNodeLeft, y: offSet //top-left
	}, {
		x: insetNodeLeft, y: height / 2 //middle-left
	}, {
		x: insetNodeLeft, y: height - offSet //bottom-left
	}, {
		x: offSet + width / 2, y: height - insetNode + 1 //bottom-middle
	}, {
		x: width - insetNode + offSet, y: offSet //top-right
	}, {
		x: width - insetNode + offSet, y: height / 2 //middle-right
	}, {
		x: width - insetNode + offSet, y: height - offSet //bottom-right
	}, {
		x: offSet + width / 2, y: offSet / 2 - 1 //top-middle
	}];

	return {
		label: node.label,
		x: positions[index].x,
		y: positions[index].y,
		direction: directionMap[index]
	};
}
