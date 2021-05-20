export const base64Encode = ( stringInput ) => {
	// READ MORE: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
	const normalizedInput = encodeURIComponent( stringInput )
		.replace(
			/%([0-9A-F]{2})/g,
			function toSolidBytes( $0, hex ) {
					return( String.fromCharCode( "0x" + hex ) );
			}
		);
	return btoa( normalizedInput );
};

export function memorySizeOf(obj) {
	var bytes = 0;

	function sizeOf(obj) {
		if (obj !== null && obj !== undefined) {
			switch (typeof obj) {
				case 'number':
					bytes += 8;
					break;
				case 'string':
					bytes += obj.length * 2;
					break;
				case 'boolean':
					bytes += 4;
					break;
				case 'object':
					var objClass = Object.prototype.toString.call(obj).slice(8, -1);
					if (objClass === 'Object' || objClass === 'Array') {
						for (var key in obj) {
							if (!obj.hasOwnProperty(key)) continue;
							sizeOf(obj[key]);
						}
					} else bytes += obj.toString().length * 2;
					break;
			}
		}
		return bytes;
	};

	function formatByteSize(bytes) {
		if (bytes < 1024) return bytes + " bytes";
		else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " kB";
		else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
		else return (bytes / 1073741824).toFixed(3) + " GB";
	};

	return formatByteSize(sizeOf(obj));
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

export const tryFn = (fn, ...args) => {
	try {
		return fn(...args);
	} catch (e) {
		return undefined;
	}
};

export const tryParse = (text) => tryFn(JSON.parse, text);

export const clone = (obj) => {
	try {
		//TODO: handle circular refs with stringify
		return JSON.parse(JSON.stringify(obj));
	} catch(e) {
		return undefined;
	}
};

export function flatPromise() {
	let resolve, reject;
	const promise = new Promise((res, rej) => {
			resolve = res;
			reject = rej;
	});
	return { promise, resolve, reject };
}

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// OMG - https://stackoverflow.com/questions/27746304/how-do-i-tell-if-an-object-is-a-promise
export const isPromise = function (object) {
	return object && typeof object.then === 'function';
};

export const fetchJson = async (url, opts) => await (await fetch(url, opts)).json();
export const fetchJSON = fetchJson;

export const fetchText = async (url, opts) => await (await fetch(url, opts)).json();
export const fetchTEXT = fetchText;
