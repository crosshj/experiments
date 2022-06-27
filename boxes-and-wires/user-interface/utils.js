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