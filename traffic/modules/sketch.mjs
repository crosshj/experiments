import Sketch from "https://dev.jspm.io/sketch-js/js/sketch.min.js";

/*
TODO:

- change lane
- don't collide:
	- detect if change lane is needed
	- react when stuck


*/


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
	const CLIENT_HEIGHT = document.querySelector('.container.canvas').clientHeight;
	const CLIENT_WIDTH = document.querySelector('.container.canvas').clientWidth;
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
		container: document.querySelector('.container.canvas'),
		//retina: 'auto'
	});

	// ----------------------------------------
	// Particle
	// ----------------------------------------
	function Particle(x, y, lane, radius, sense) {
		this.init(x, y, lane, radius, sense);
	}
	Particle.prototype = {
		init: function (x, y, lane, radius, sense) {
			this.sense = (view) => sense(this, view);
			//console.log(`vehicle spawn at lane: ${lane}`)
			this.alive = true;
			this.radius = radius || 10;
			this.wander = 0;
			//this.theta = random(TWO_PI);
			//this.drag = 0.92;
			//this.color = '#fff';
			this.lane = lane;
			this.x = x || 0.0;
			this.y = y || 0.0;
			//this.vx = 0.0;
			//this.vy = 0.0;
			const speed = random(1, 2);
			this.life = demo.height / speed;
			this.speed = speed;
		},
		changeLane: function () {
			// if(Math.random() > 0.005){
			// 	return;
			// }
			const transitionLength = Math.floor(10 / this.speed);
			var changeDirection = (Math.random() >= 0.25
				? -1 // pass left
				: 1  // pass right
			);
			if (this.lane === 1) {
				changeDirection = 1;
			}
			if (this.lane === LANES_COUNT) {
				changeDirection = -1;
			}
			this.lane += changeDirection;
			const change = changeDirection * CAR_WIDTH;
			const postChange = (new Array(10)).fill(0)
			this.changing = (new Array(transitionLength))
				.fill(change / transitionLength)
				.concat(postChange);
		},
		move: function () {
			const isChangingLane = this.changing && this.changing.length;
			if (isChangingLane) {
				const delta = this.changing.pop();
				this.x += delta;
				if (!this.changing.length) {
					//console.log(this.lane)
					this.x = DEMO_MARGIN + ((this.lane - 1) * CAR_WIDTH) + (CAR_WIDTH / 2)
				}
			} else {
				const frontCar = this.sense('front');
				if (frontCar && this.y - frontCar.y <= (20 * this.speed)) {
					this.changeLane();
					//console.log(`car in front at ${this.y - frontCar.y}`);
				}
			}

			//this.x += this.vx;
			// this.y -= this.changing && this.changing.length
			// 	? 1.5 * this.speed
			// 	: this.speed;
			this.y -= this.speed;
			//this.vx *= this.drag;
			//this.vy *= this.drag;
			//this.theta += random(-0.5, 0.5) * this.wander;
			//this.radius *= 0.99;
			this.life -= 1;
			this.alive = this.life > 0;
		},
		draw: function (ctx) {
			ctx.beginPath();
			ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
			ctx.fillStyle = this.changing && this.changing.length
				? 'red'
				: this.color;
			ctx.fill();
		}
	};

	function Road(x, y, lanes, laneWidth) {
		this.init(x, y, lanes, laneWidth);
	}
	Road.prototype = {
		init: function (x, y, lanes, laneWidth) {
			this.x = x;
			this.y = y;
			this.lanes = lanes;
			this.laneWidth = laneWidth;
		},
		draw: function (ctx) {
			// outside lines
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(this.x, CLIENT_HEIGHT);
			const laneRightX = this.x + (this.lanes * this.laneWidth);
			ctx.moveTo(laneRightX, this.y);
			ctx.lineTo(laneRightX, CLIENT_HEIGHT);
			ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
			ctx.stroke();

			// lane lines
			ctx.setLineDash([3, 5.5]);
			ctx.beginPath();
			for (var l = 1; l < this.lanes; l++) {
				const lineX = this.x + l * this.laneWidth;
				ctx.moveTo(lineX, this.y);
				ctx.lineTo(lineX, CLIENT_HEIGHT);
			}
			ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
			ctx.stroke();
		}
	};

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
		particle = new Particle(x, y, lane, CAR_WIDTH / 2, sense);
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
			particles[i].move();
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
		const observation = {
			action, result
		};
		return observation;
	}
	demo.draw = function () {
		road.draw(demo);

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

	demo.restart = setupSketch;

	return demo;
};

export default setupSketch();
