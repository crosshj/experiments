import Sketch from "https://dev.jspm.io/sketch-js/js/sketch.min.js";
import Particle from '../models/Particle.mjs';
import Road from '../models/Road.mjs';

/*
TODO:

- change lane
- don't collide:
	- detect if change lane is needed
	- react when stuck


*/

function debounce(func, time){
	var time = time || 100; // 100 by default if no param
	var timer;
	return function(event){
			if(timer) clearTimeout(timer);
			timer = setTimeout(func, time, event);
	};
}


const setupSketch = () => {
	// ----------------------------------------
	// Example
	// ----------------------------------------
	var MAX_PARTICLES = 500;
	var COLOURS = [
		'#69D2E7', //blue
		'#A7DBD8', //lightblue
		'#E0E4CC', //lightyellow
		'#f7ac73', //lightorange
		'#B794F7', //purple
		'#86C58B', //lightgreen
		'#A37666' //lightbrown
	];
	const CAR_WIDTH = 10;
	const CLIENT_HEIGHT = document.querySelector('.container.canvas.road').clientHeight;
	const CLIENT_WIDTH = document.querySelector('.container.canvas.road').clientWidth;
	const LANES_COUNT = 10;
	const DEMO_MARGIN = Math.floor((CLIENT_WIDTH - LANES_COUNT * CAR_WIDTH) / 2);

	var particles = [];
	var pool = [];
	var road = undefined;

	var demo = Sketch.create({
		interval: 1.5,
		fullscreen: false,
		height: CLIENT_HEIGHT,
		width: CLIENT_WIDTH,
		container: document.querySelector('.container.canvas.road'),
		//retina: 'auto'
	});
	demo.margin = DEMO_MARGIN;

	demo.setup = function () {
		road = new Road();
		road.init(DEMO_MARGIN, 0, LANES_COUNT, CAR_WIDTH);
		// Set off some initial particles.
		// var i, x, y;
		// for (i = 0; i < 100; i++) {
		// 	x = (demo.width * 0.5) + random(-100, 100);
		// 	y = (demo.height * 0.5) + random(-100, 100);
		// 	demo.spawn(x, y);
		// }
	};
	demo.spawn = function (x, y, lane, sense) {
		var particle, theta, force;
		if (particles.length >= MAX_PARTICLES) {
			return;
			//pool.push(particles.shift());
		}
		//particle = pool.length ? pool.pop() : new Particle(x, y, lane, CAR_WIDTH/2);
		particle = new Particle(demo, x, y, lane, CAR_WIDTH / 2, sense);
		particle.direction = 270;
		//particle.init(x, y, lane, CAR_WIDTH/2);
		//particle.wander = random(0.5, 2.0);
		particle.color = random(COLOURS);
		//particle.drag = random(0.9, 0.99);
		//theta = random(TWO_PI);
		//force = random(2, 8);
		//particle.vx = sin(theta) * force;
		//particle.vy = cos(theta) * force;
		particles.push(particle);
		//console.log({ particles: particles.length })
	};
	demo.update = function () {
		particles = particles.filter(p => p.alive);
		//var i, particle;
		for (var i = particles.length - 1; i >= 0; i--) {
			particles[i].move(LANES_COUNT, CAR_WIDTH);
			// particle = particles[i];
			// if (particle.alive) particle.move();
			// else pool.push(particles.splice(i, 1)[0]);
		}
	};
	function sense(observer, view) {
		var result = undefined;
		if (view === 'front') {
			// all cars in front
			const frontCars = particles.filter(p => p.x === observer.x && observer.y > p.y);
			// only closest car to observer
			return frontCars.length
				? frontCars.sort((a, b) => b.y - a.y)[0]
				: undefined;
		}
		if(view === 'proximity'){
				const neighbors = particles.filter(p =>
						observer.id !== p.id &&
						Math.abs(p.x - observer.x) < 20
						&& Math.abs(p.y - observer.y) < 20
				);
				return neighbors;
		}
		const observation = {
			action, result
		};
		return observation;
	}
	demo.draw = function () {
		road.draw(demo, CLIENT_HEIGHT);

		//if(particles.length < 200){
		// for (var j = DEMO_MARGIN, lane = 1; j < demo.width-DEMO_MARGIN-1; j+=CAR_WIDTH, lane++) {
		// 	if(random(0, 1000) > 991){
		// 		demo.spawn(j+(CAR_WIDTH/2), demo.height, lane);
		// 	}
		// }
		//}

		for (var lane = 1; lane <= LANES_COUNT; lane++) {
			if (random(0, 1000) > 985) {
				demo.spawn(
					DEMO_MARGIN + ((lane - 1) * CAR_WIDTH) + (CAR_WIDTH / 2),
					demo.height,
					lane,
					sense
				);
			}
		}

		demo.globalCompositeOperation = 'lighter';
		for (var i = particles.length - 1; i >= 0; i--) {
			particles[i].draw(demo);
		}

		document.getElementById('stats-qty').innerText = particles.length;
		document.getElementById('stats-speed').innerText = particles.length
			? (50 * particles.reduce((all, one) => all + one.speed, 0) / particles.length).toFixed(2)
			: 0;
	};

	demo.restart = () => {
		window.removeEventListener("resize", demo.resizeListener);
		demo.destroy();
		demo = setupSketch();
	};

	demo.resizeListener = debounce(demo.restart, 100);
	window.addEventListener("resize", demo.resizeListener);

	return demo;
};

export default setupSketch;
