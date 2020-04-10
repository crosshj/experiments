import { attachListener } from './events/services.mjs';

const styles = `
<style>

	#services {
		position: absolute;
		left: 50px; top: 0; right: 0; bottom: 0;
		/*background: var(--main-theme-color);*/
		/*background: var(--main-theme-background-color);*/
		background: var(--theme-subdued-color);
    z-index: 99;
	}

	svg#canvas {
		width: 100%;
		height: 100%;
	}

	.node-bg, .node-border-1 {
		fill: none;
		/*fill: rgba(255, 255, 255, 0.2);*/
	}
	.node-border-2 {
		stroke: #999;
	}
	.node-center-dot {
		fill: #555;
	}


</style>
`;

const createSVGElement = (type) =>
	document.createElementNS("http://www.w3.org/2000/svg", type);

function Node({ x, y, scale, label }){
	const node = 	createSVGElement('g');
	node.classList.add('node');
	node.innerHTML = `
		<g transform="translate(${x},${y}) scale(${scale})" draggable="true">
			<g class="_GraphNodeStatic__GraphNodeWrapper-xnsael-0 cNyCOA">
				<foreignObject y="27.5" x="-68.75" width="137.5" height="200px" style="pointer-events: none; text-align: center;">
					<div class="r">
						<div class="">
							<span title="${label}">${label}</span>
						</div>
						<!-- div class="_GraphNodeStatic__LabelMinorStandard-xnsael-7 djKDkA _GraphNodeStatic__LabelTemplate-xnsael-5 haMutc">
							<span title="ubuntu">ubuntu</span>
						</div -->
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

let services;
function Services(){
	if(services){
		return;
	}
	services = document.getElementById('services');
	services.classList.add('hidden');
	//document.querySelector('#terminal').style.visibility = "hidden";
	services.innerHTML = `
		${styles}
		<svg id="canvas" class="">
		</svg>
	`;
	const canvas = services.querySelector('svg');
	const labels = [
		"API Server",
    "Scheduler",
    "Controller Manager",
    "etcd",
    "Worker 1",
		"Worker 2"
	];
	const labels2 = [
    "template server",
    "http basic",
		"express",
		"fastify"
	];
	const LEFT_OFFSET = 230;
	let j = 1;
	for(var i=0, len=labels.length; i < len; i++){
		const x = (j===2 ? 150 : 0) + LEFT_OFFSET + i%4 * 150;
		const y = 50 +  j * 100;
		if(i%4 === 3){
			j++;
		}
		const node1 = Node({ x, y, scale: 1, label: labels[i] });
		canvas.appendChild(node1);
	}
	for(var i=0, len=labels2.length; i < len; i++){
		const x = LEFT_OFFSET + i%4 * 150;
		const y = 350 +  j * 100;
		if(i%4 === 3){
			j++;
		}
		const node1 = Node({ x, y, scale: 1, label: labels2[i] });
		canvas.appendChild(node1);
	}
	attachListener({
		showServiceMap: () => services.classList.remove('hidden'),
		hideServiceMap: () => services.classList.add('hidden')
	});

	const _canvas = services.querySelector('#canvas')

	let transX=0, transY=0, offsetX=0, offsetY=0;
	_canvas.onpointerdown = (pointerDownEvent) => {
		let firstX = pointerDownEvent.clientX - transX;
		let firstY = pointerDownEvent.clientY - transY;

		const detachListeners = (detachEvent) => {
			transX = offsetX;
			transY = offsetY;
			document.onpointermove = document.onpointerup = null;
			detachEvent.preventDefault();
			return false;
		};

		document.onpointermove = (pointerMoveEvent) => {
			let currentX = pointerMoveEvent.clientX;
			let currentY = pointerMoveEvent.clientY;
			offsetX = currentX - firstX;
			offsetY = currentY - firstY;

			_canvas.style.transform = `translate(${offsetX}px,${offsetY}px)`;

			pointerMoveEvent.preventDefault();
			return false;
		};
		document.onpointerup = detachListeners;

		pointerDownEvent.preventDefault();
		return false;
	}

	canvas.onpointerup = function(e){

	}

	//transform: translate(184px,150px);

}

export default Services;
