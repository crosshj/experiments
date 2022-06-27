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