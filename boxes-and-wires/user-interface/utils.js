import { mapNodeToState } from './nodes.js';

export const tryParse = text => {
	try {
		return JSON.parse(text);
	} catch (e) {
		return undefined;
	}
};

export const clone = (obj) => {
	return JSON.parse(JSON.stringify(obj));
};

export const withAnimFrame = (fn) => (arg) => window.requestAnimationFrame(() => fn(arg));


export const setStyle = (id, rules) => {
	var css = document.getElementById(id);
	if (!css) {
		css = document.createElement('style');
		css.type = 'text/css';
		css.id = id;
		document.getElementsByTagName("head")[0].appendChild(css);
	}
	if (css.styleSheet) {
		css.styleSheet.cssText = rules;
	} else {
		css.appendChild(document.createTextNode(rules));
	}
};

export const removeStyle = (id) => {
	var sSheet = document.getElementById(id);
	if (sSheet) {
		sSheet.parentNode.removeChild(sSheet);
	}
};

export function bringToTop(targetElement) {
	let parent = targetElement.parentNode;
	parent.appendChild(targetElement);
};

//https://trendct.org/2016/01/22/how-to-choose-a-label-color-to-contrast-with-background/
export function overlayColor(color) {
	if (color.length < 5) {
		color += color.slice(1);
	}
	return (color.replace('#', '0x')) > (0xffffff / 2) ? '#111' : '#eee';
}

export const getTranslateX = node => {
	const transform = node.getAttribute('transform');
	const splitChar = transform.includes(',') ? ',' : ' ';
	if (!transform.split(splitChar)[0]) {
		debugger;
	}
	return Number(transform.split(splitChar)[0].split('(')[1]);
};

export const getTranslateY = node => {
	const transform = node.getAttribute('transform');
	const splitChar = transform.includes(',') ? ',' : ' ';
	if (!transform.split(splitChar)[1]) {
		debugger;
	}
	return Number(transform.split(splitChar)[1].split(')')[0]);
};

export function initState({ units, links }) {
	const u = units.map(unit => ({
		label: unit.label,
		color: unit.color,
		class: unit.class,
		x: unit.x,
		y: unit.y,
		width: unit.width,
		height: unit.height,
		nodes: unit.nodes.map(mapNodeToState.bind({ unit }))
	}));

	const l = links.map(link => {
		const stripParent = {
			getNode: (block, node) => ({ block, node })
		};

		const _link = ['start', 'end'].reduce((all, name) => {
			const parent = link[name](stripParent);
			const unit = u.find(unit => unit && unit.label === parent.block);
			const node = unit.nodes.find(node => node && node.label === parent.node);
			if (link.selected) {
				node.selected = true;
			}
			all[name] = {
				x: unit.x + node.x,
				y: unit.y + node.y,
				parent,
				direction: node.direction
			};
			return all;
		}, {});
		_link.label = link.label || Math.random().toString(26).replace('0.', '');
		_link.selected = link.selected;
		return _link;
	});
	return { units: u, links: l };
}
