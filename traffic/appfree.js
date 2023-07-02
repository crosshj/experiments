//import Sketch from './modules/sketch.mjs';

//window.DEBUG_CHUNK = true;
window.DEBUG = true;
window.DEBUG_CAR = 1;

let mode = "simulation";
// mode = "testCar";

const modes = {
	"simulation": async () => {
		const { default: RoadMap } = await import("./modules/map.mjs");
		const map = new RoadMap();
		map.start();
	},
	"testCar": async () => {
		const { default: TestCar } = await import("./modules/testCar.mjs");
		const carTest = new TestCar();
		carTest.start();
	},
};

modes[mode]();
