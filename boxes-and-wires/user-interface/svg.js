const SVG = () => {
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
</defs>

<g id="links">
	<!-- LINKS ARE CREATED DYNAMICALLY -->
</g>
	`;
	document.body.append(svg);
	return svg;
};

export default SVG;
