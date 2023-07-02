const centerSettings = window.localStorage.getItem('mapCenter');

let center = centerSettings
	? JSON.parse(centerSettings)
	: {
		x: 0,
		y: 0
	};
const set = (settings) => {
	center = settings;
	window.localStorage.setItem(
		'mapCenter',
		JSON.stringify(settings)
	);
};

const get = () => {
	return center;
};

export {
	set, get
};