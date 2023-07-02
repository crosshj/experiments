const hashCode = s => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);
const dateHash = hashCode((new Date()).toString())

const distance = (self, target) => {
	const {x, y} = self;
	const {x: x2, y: y2} = target;
	const distance =  Math.hypot(x2 -x, y2 - y);
	return distance;
};

function debounce(func, time) {
	var time = time || 100; // 100 by default if no param
	var timer;
	return function (event) {
		if (timer) clearTimeout(timer);
		timer = setTimeout(func, time, event);
	};
}

const clone = o => JSON.parse(JSON.stringify(o));

function extendConsole(){
	let prevArgs;
	console.unique = function consoleUnique(){
		if(JSON.stringify(prevArgs) === JSON.stringify(arguments)){
			return;
		}
		prevArgs = arguments;
		console.log.apply(console, [...arguments]);
	}
}

export {
	hashCode, clone, dateHash, distance, debounce, extendConsole
};
