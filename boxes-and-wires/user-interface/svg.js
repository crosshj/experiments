// import svgjs from 'https://cdn.skypack.dev/svgjs';
//import Snap from 'https://cdn.skypack.dev/snapsvg'

/*
pan/zoom:
https://onestepcode.com/zoom-pan-effect-svg/

patterns (grid):
https://thenewcode.com/245/SVG-Backgrounds-CrossHatching-Grids-and-Checkerboards
*/

const Canvas = () => {
	const w3Org = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(w3Org, 'svg');
	svg.id = "canvas";
	svg.setAttribute('preserveAspectRatio', 'none');
	svg.setAttribute('viewBox', '0 0 500 500');
	svg.setAttribute("xmlns", w3Org);
	svg.innerHTML = `
<defs>
	<filter id="outline">
		<feMorphology operator="dilate" in="SourceGraphic" result="DILATED" radius="1" />
		<feFlood flood-color="#aa00aa" flood-opacity="1" result="COLORED"></feFlood>
		<feComposite in="COLORED" in2="DILATED" operator="in" result="OUTLINE"></feComposite>
		<feMerge>
			<feMergeNode in="OUTLINE" />
			<feMergeNode in="SourceGraphic" />
		</feMerge>
	</filter>

	<filter id="f3" x="-3%" y="-6%" width="106%" height="112%">
		<feFlood id="f4" flood-color="#f0f" flood-opacity="0" result="COLORED"></feFlood>
		<feOffset result="offOut" in="COLORED" dx="0" dy="0" />
		<feGaussianBlur result="blurOut" in="offOut" stdDeviation="10" />
		<feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
	</filter>
	<filter id="f6" x="-10%" y="-20%" width="120%" height="140%">
		<feMorphology id="f77" operator="dilate" in="SourceGraphic" result="DILATED" radius="1" />
		<feFlood id="f7" flood-color="#aa00aa" flood-opacity=".8" result="COLORED"></feFlood>
		<feComposite in="COLORED" in2="DILATED" operator="in" result="OUTLINE"></feComposite>
		<feGaussianBlur result="BLUR" in="OUTLINE" stdDeviation="1" />
		<feBlend in="OUTLINE" in2="BLUR" mode="normal" />

		<feMerge>
			<feMergeNode in="BLUR" />
			<feMergeNode in="SourceGraphic" />
		</feMerge>
	</filter>
	<!-- <animate
		xlink:href="#f7"
		attributeName="flood-opacity"
		values="1;0.40;1"
		dur="2s"
		repeatCount="indefinite"
	/> -->
	<animate
		xlink:href="#f77"
		attributeName="radius"
		values="0;3;0"
		dur="1s"
		repeatCount="indefinite"
	/>
	<animate
		xlink:href="#f7"
		attributeName="flood-color"
		values="#00f0;#f0ff;#00f0;"
		dur="1s"
		repeatCount="indefinite"
	/>
	<pattern id="grid" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="">
		<line x1="0" y1="0" x2="0" y2="20" stroke="#292929" />
		<line x1="0" y1="0" x2="20" y2="0" stroke="#292929" />
	</pattern>
</defs>
<rect id="backgroundGrid" width="1000%" height="1000%" fill="url(#grid)" x="-500%" y="-500%"/>
<g id="container">
	<g id="links"></g>
	<g id="nodes"></g>
</g>
`;

	const backgroundGrid = svg.getElementById('backgroundGrid');
	const container = svg.getElementById('container');
	const pt=svg.createSVGPoint();

	let scale = 1.0;
	let panX = 0;
	let panY = 0;
	
	const updateTransform = () => {
		backgroundGrid.style.transform = `scale(${scale}) translateX(${panX}px) translateY(${panY}px)`;
		container.style.transform = `scale(${scale}) translateX(${panX}px) translateY(${panY}px)`;
	};

	let mouseStart;
	// Convert mouse position from screen space to coordinates of el
	function inElementSpace(evt){
		pt.x=evt.clientX; pt.y=evt.clientY;
		//return pt.matrixTransform(svg.getScreenCTM().inverse());
		return {
			x: evt.clientX,
			y: evt.clientY
		}
	}
	const drag = (evt) => {
		const point = inElementSpace(evt);
		panX = panX + (point.x - mouseStart.x)/100; //pan amount should also account for scale
		panY = panY + (point.y - mouseStart.y)/100; //pan amount should also account for scale
		updateTransform();
	};
	svg.addEventListener('mouseup', () => {
		svg.removeEventListener('mousemove', drag);
	});
	svg.addEventListener('mousedown', (evt) => {
		if(evt.target !== backgroundGrid) return;
		mouseStart = inElementSpace(evt);
		svg.addEventListener('mousemove', drag);
	});

	svg.addEventListener('wheel', (ev) => {
		ev.preventDefault();
		// This is an empirically determined heuristic.
		// Unfortunately I don't know of any way to do this better.
		// Typical deltaY values from a trackpad pinch are under 1.0
		// Typical deltaY values from a mouse wheel are more than 100.
		let isPinch = Math.abs(ev.deltaY) < 50;

		if (isPinch) {
			let factor = 1 - 0.01 * ev.deltaY;
			scale *= factor;
			//console.log(`Pinch: scale is ${scale}`);
		} else {
			let strength = 1.4;
			let factor = ev.deltaY < 0 ? strength : 1.0 / strength;
			scale *= factor;
			//console.log(`Mouse: scale is ${scale}`);
		}
		updateTransform();
	});
	document.body.append(svg);
	return svg;
};

export default Canvas;
