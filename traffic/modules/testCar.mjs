import RenderCar from '../render/car.mjs';
import { setConstants } from './utilities.mjs';

/*
	in fiug.dev: preview traffic/appfree.html

*/


function Canvas(){
	const container = document.createElement('div');
	container.style.position = "absolute";
	container.style.display = "flex";
	container.style.top = container.style.bottom = container.style.left = container.style.right = 0;

	const canvas = document.createElement('canvas');
	canvas.width = 40;
	canvas.height = 40;
	canvas.style.margin = "auto";
	canvas.style.imageRendering = "pixelated";
	canvas.style.zoom = 20;
	canvas.style.background = "#333"

	document.body.appendChild(container);
	container.appendChild(canvas);
	return canvas;
}

function setup(){
	setConstants();
	this.canvas = new Canvas();
	this.ctx = this.canvas.getContext("2d");
	this.ctx.imageSmoothingEnabled = false;

	const COLORS = [
		'#69D2E7', //blue
		'#A7DBD8', //lightblue
		'#E0E4CC', //lightyellow
		'#f7ac73', //lightorange
		'#B794F7', //purple
		'#86C58B', //lightgreen
		'#A37666' //lightbrown
	];

	this.car = {
		alive: true,
		color: COLORS[4],
		direction: 0,
		x: 20,
		y: 20,
		radius: 3
	};
}

function start() {
	console.log('test car start')
	RenderCar(this.ctx, this.car);
}

class TestCar {
	constructor(){
		setup.bind(this)();
		this.start = start.bind(this);
	}
};

export default TestCar;