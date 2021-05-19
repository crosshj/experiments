const base64Encode = ( stringInput ) => {
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

const withAnimFrame = (fn) => (arg) => window.requestAnimationFrame(() => fn(arg));

const setStyle = (id, rules) => {
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

const removeStyle = (id) => {
	var sSheet = document.getElementById(id);
	if (sSheet) {
		sSheet.parentNode.removeChild(sSheet);
	}
};

const tryFn = (fn, ...args) => {
	try {
		return fn(...args);
	} catch (e) {
		return undefined;
	}
};

const tryParse = (text) => tryFn(JSON.parse, text);

const clone = (obj) => {
	try {
		//TODO: handle circular refs with stringify
		return JSON.parse(JSON.stringify(obj));
	} catch(e) {
		return undefined;
	}
};

function flatPromise() {
	let resolve, reject;
	const promise = new Promise((res, rej) => {
			resolve = res;
			reject = rej;
	});
	return { promise, resolve, reject };
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// OMG - https://stackoverflow.com/questions/27746304/how-do-i-tell-if-an-object-is-a-promise
const isPromise = function (object) {
	return object && typeof object.then === 'function';
};

const fetchJson = async (url, opts) => await (await fetch(url, opts)).json();
const fetchJSON = fetchJson;

const fetchText = async (url, opts) => await (await fetch(url, opts)).json();
const fetchTEXT = fetchText;
