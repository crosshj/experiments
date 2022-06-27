


import SVG from './svg.js';
import { drawLink, animateLink } from './links.js';
import { drawOrUpdateUnit, mapNodeToState } from './nodes.js';
import { makeDraggable } from './dragDrop.js';
import { complex as Config } from '../state/config.js';
import { initState } from './utils.js';
import { render } from './wires.js';

async function uiTest(){
	const svg = SVG();
	const { units, links } = initState({
		units: Config.boxes,
		links: Config.wires
	});
	for(var unit of units){
		await new Promise((resolve) => {
			drawOrUpdateUnit(unit, resolve);
		});
	}
	for(var link of links){
		await new Promise((resolve) => {
			drawLink(link, resolve);
		});
	}
	const state = {
		units, links, svg,
		hovered: undefined,
		draggedUnit: undefined,
		draggedLink: undefined,
		selectedLinks: [],
		selectedElement: undefined,
		offset: undefined,
		transform: undefined
	};
	state.update = async (fn) => {
		await fn(state);
		await render.bind(state)(state);
	}

	makeDraggable(state);
	//addLinkEffects(state);
}

export default uiTest;
