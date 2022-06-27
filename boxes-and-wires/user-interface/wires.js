import {
	tryParse, clone, setStyle, removeStyle,
	bringToTop, getTranslateX, getTranslateY,
	initState, withAnimFrame,
} from './utils.js';
import { drawLink, animateLink } from './links.js';
import { drawOrUpdateUnit } from './nodes.js';
import { makeDraggable } from './dragDrop.js';

// ----------------------------------------------------------------

function hoverStart(event) {
	if (this.selectedElement) {
		return;
	}
	const currentState = this.read();
	const units = currentState.units;
	const links = currentState.links;

	const getNodeIndex = (el) => Array.from(
		el.parentNode.querySelectorAll('circle')
	).indexOf(el);
	const getHelperIndex = (el) => Array.from(
		el.parentNode.querySelectorAll('.helper-segment')
	).indexOf(el);

	const getNodeHelpers = (el) => Array.from(
		el.parentNode.querySelectorAll('.helpers path')
	);
	const getNodeForHelper = (el) => {
		return el.parentNode.parentNode.querySelectorAll('circle')[getHelperIndex(el)];
	};
	const getHelper = (el) => (getNodeHelpers(el) || [])[getNodeIndex(el)];

	if (event.target.tagName === 'path' && !event.target.classList.contains('helper-segment')) {
		const linkLabel = event.target.parentNode.getAttribute('data-label');
		const linkElement = event.target.parentNode;
		const link = (links.filter(x => x.label === linkLabel) || [])[0];
		const start = document
			.querySelector(`.box[data-label="${link.start.parent.block}"] circle[data-label="${link.start.parent.node}"]`);
		const end = document
			.querySelector(`.box[data-label="${link.end.parent.block}"] circle[data-label="${link.end.parent.node}"]`);
		if (!start || !end) {
			debugger;
		}
		const startHelper = getHelper(start);
		const endHelper = getHelper(end);
		bringToTop(linkElement);
		this.hovered = [linkElement, end, start, endHelper, startHelper];
		this.hovered.forEach(el => el.classList.add('hovered'));
	}
	if (event.target.tagName === 'circle') {
		const helper = getHelper(event.target);
		const node = event.target;
		this.hovered = [helper, node];
		if (!helper || !node) {
			debugger
		}
		this.hovered.forEach(el => el.classList.add('hovered'));
	}
	if (event.target.classList.contains('helper-segment')) {
		const helper = event.target;
		const node = getNodeForHelper(event.target);
		if (!helper || !node) {
			debugger
		}
		this.hovered = [helper, node];
		this.hovered.forEach(el => el.classList.add('hovered'));
	}
}

function hoverEnd(event) {
	if (this.hovered) {
		this.hovered.forEach(el => el.classList.remove('hovered'));
		this.hovered = undefined;
	}
}

function linkClick(event) {
	const t = event.target;
	var link;
	if (t.tagName === 'path' && t.parentNode.classList.contains('link')) {
		link = t.parentNode;
	}

	if (t.classList.contains('link')) {
		link = t;
	}
	if (!link) {
		return;
	}
	this.update(({ units, links }) => {
		console.log('clicked a link: ', link.dataset.label);
		const clickedStateLink = links.find(l => l.label === link.dataset.label);
		clickedStateLink.selected = !clickedStateLink.selected;
		if (!clickedStateLink.selected) {
			delete clickedStateLink.selected;
		}
		console.log('TODO: also select nodes');
		return { links };
	});
}

function addLinkEffects(state) {
	var svg = state.svg;
	const hoverStartHandler = hoverStart.bind(state);
	const hoverEndHandler = hoverEnd.bind(state);
	const clickHandler = linkClick.bind(state);
	svg.addEventListener("mouseover", hoverStartHandler);
	svg.addEventListener('mouseout', hoverEndHandler);
	svg.addEventListener('mouseleave', hoverEndHandler);
	svg.addEventListener('click', clickHandler);
}

// ----------------------------------------------------------------

function cleanScene(state) {
	const domLinks = Array.from(document.querySelectorAll('.link'));
	const domUnits = Array.from(document.querySelectorAll('.box'));
	const stateUnitLabels = state.units.map(x => x.label);
	const stateLinkLabels = state.links.map(x => x.label);

	domUnits.forEach(unit => {
		const label = unit.dataset.label;
		if (!stateUnitLabels.includes(label)) {
			unit.parentNode.removeChild(unit);
		}
	});

	domLinks.forEach(link => {
		const label = link.dataset.label;
		if (!stateLinkLabels.includes(label)) {
			link.parentNode.removeChild(link);
		}
	});
}

function getDom() {
	const dom = Array.from(document.querySelectorAll('.box'))
		.map(u => {
			const { label } = u.dataset;
			const el = u;
			const children = Array.from(u.querySelectorAll('.node'));
			const helpers = Array.from(u.querySelectorAll('.helper-segment'));
			return {
				label, children, helpers, el
			};
		});
	return dom;
};

export function render(_state) {
	const state = typeof _state.read === 'function' ? _state.read()
		: _state;

	cleanScene(state);

	const domUnits = Array.from(document.querySelectorAll('.box'))
		.map(element => ({
			element,
			label: element.dataset.label,
			class: Array.from(element.classList)
				.filter(c => !(c === 'box' || c === 'draggable-group'))
				.join(' '),
			position: {
				x: getTranslateX(element),
				y: getTranslateY(element)
			}
		}));

	const unitsToUpdate = state.units.filter(unit => {
		const domMatch = domUnits.find(d => d.label === unit.label);
		if (!domMatch) {
			return true;
		}

		const hasMoved = domMatch.position.x !== unit.x
			|| domMatch.position.y !== unit.y;
		const classChanged = domMatch.class !== unit.class;

		return hasMoved || classChanged;
	});

	clone(unitsToUpdate).forEach(withAnimFrame(drawOrUpdateUnit));

	const domLinks = Array.from(document.querySelectorAll('g.link'));
	const linksToUpdate = state.links
		.reduce((all, one) => {
			const unitsToUpdateLabels = unitsToUpdate.map(u => u.label);
			const linkStartConnected = () => {
				const startParent = one.start.parent.block;
				return unitsToUpdateLabels.includes(startParent);
			};
			const linkEndConnected = () => {
				const endParent = one.end.parent.block;
				return unitsToUpdateLabels.includes(endParent);
			};
			const linkNewlySelected = () => {
				const isSelected = one.selected;
				const isInSelectedLinks = this.selectedLinks.includes(one.label);
				if (isSelected && !isInSelectedLinks) {
					this.selectedLinks.push(one.label);
				}
				if (!isSelected && isInSelectedLinks) {
					this.selectedLinks = this.selectedLinks.filter(x => x === one.label);
				}
				return isSelected && !isInSelectedLinks;
			};
			const linkClassChanged = () => {
				const domLink = domLinks.find(d => d.dataset.label === one.label);
				if (!domLink) {
					return;
				}
				const domClass = domLink.getAttribute('class');
				return domClass === ('link ' + one.class);
			};
			if (linkClassChanged() || linkStartConnected() || linkEndConnected() || linkNewlySelected()) {
				all.push(one)
			}
			return all;
		}, []);

	clone(linksToUpdate).forEach(withAnimFrame(drawLink));
}

//---------------------------------------------------------------
function engineBindState(Engine, _state) {
	const cleanClass = (stateClass) => {
		return (stateClass || '')
			.replace(' fail', '')
			.replace(' wait', '')
			.replace(' pulse', '')
			.replace('fail', '')
			.replace('wait', '')
			.replace('pulse', '');
	};

	var t0;
	const emitStep = (data) => {
		t0 = t0 || performance.now();
		var t1 = performance.now();
		var tDiff = Math.floor(t1 - t0);
		t0 = t1 + 0;
		const { label } = (data.src || data);
		const linkSpacer = data.name === 'link' && data.state === 'success'
			? '\n\n'
			: '';
	};

	const unitsChange = (data) => {
		data.forEach(d => emitStep({name: 'unit', ...d}));
		_state.update(({ units }) => {
			data.forEach(u => {
				const stateUnit = units.find(s => s.label === u.label);
				if (u.state === 'success') {
					stateUnit.class = cleanClass(stateUnit.class);
					return;
				}
				if (u.state === 'active') {
					stateUnit.class = cleanClass(stateUnit.class) + " pulse";
					return;
				}
				if (u.state === 'fail') {
					stateUnit.class = cleanClass(stateUnit.class) + " fail";
					return;
				}
				if (u.state === 'wait') {
					stateUnit.class = cleanClass(stateUnit.class) + " wait";
					return;
				}
			})
			return { units };
		});
	};

	const linksChange = (data) => {
		data.forEach(d => emitStep({name: 'link', ...d}));
		_state.update(({ links }) => {
			data.forEach(u => {
				const stateLink = links.find(s => s.label === u.label);
				if (u.state === 'receive') {
					stateLink.class = (cleanClass(stateLink.class) + " pulse").trim();
					animateLink({ label: u.label }, null, 'reverse');
					stateLink.selected = true;
					return;
				}
				if (u.state === 'send') {
					stateLink.class = (cleanClass(stateLink.class) + " pulse").trim();
					animateLink({ label: u.label });
					stateLink.selected = true;
					return;
				}
				if (u.state === 'fail') {
					stateLink.class = "fail";
					return;
				}
				if (u.state === 'success') {
					stateLink.class = cleanClass(stateLink.class);
					stateLink.selected = false;
					return;
				}
				console.log({ unhandledLink: u });
			})
			return { links };
		});
	};

	Engine.on('units-change', unitsChange);
	Engine.on('links-change', linksChange);
	//Engine.on('emit-step', emitStep);
	Engine.on('emit-step', ()=>{});
}

const init = ({ State, ExpressionEngine }) => (svg, units, links) => {
	if (window.innerWidth > 750) {
		document.body.style.zoom = "150%";
	}

	const _state = new State();
	//TODO: at some point this state has to be reconciled with app state?
	//_state.svg = svg;
	const state = {
		read: _state.read,
		update: _state.update,
		svg,
		hovered: undefined,
		draggedUnit: undefined,
		draggedLink: undefined,
		selectedLinks: [],
		selectedElement: undefined,
		offset: undefined,
		transform: undefined
	};
	const renderHandler = render.bind(state);

	_state.on('create', renderHandler);
	_state.on('update', renderHandler);
	_state.on('delete', renderHandler);

	_state.on('history', (data) => {
		const historyStatsEl = document.getElementById('state-memory-size');
		if (historyStatsEl) {
			historyStatsEl.innerHTML = JSON.stringify(data)
				.replace(/[\{\}\"]/g, '')
				.replace(/\,/g, ', ');
		}
	});

	//TODO: would be nice if this went away > initState
	_state.create(initState({ units, links }));

	makeDraggable(state);
	addLinkEffects(state);

	setTimeout(() => {
		//return testEngine();
		const stateDefintion = { units, links, verbose: false }; //because state won't carry function definitions
		const Engine = new ExpressionEngine.engine(stateDefintion);

		engineBindState(Engine, _state);
		const currentState = _state.read(); //because stateDef does not have link labels
		Engine.start(currentState);
	}, 1000);

	return; 
};

export default init;
