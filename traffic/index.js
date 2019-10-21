


const editor = CodeMirror.fromTextArea(document.querySelector('.simulation .functionInput'), {
	lineNumbers: true,
	mode: "markdown",
	theme: 'bespin',
	styleActiveLine: true,
	matchBrackets: true
});

CodeMirror.keyMap.default["Shift-Tab"] = "indentLess";
CodeMirror.keyMap.default["Tab"] = "indentMore";

const notes =
`## current state:
- basic project scaffolded, using sketch.js
- some particle effects, but nothing like what is needed

## todo:
- get some basic particle system set up and make sure it can do what's needed: collision, spawn points, etc
- create roads generatively
- add vehicle particles
- explore some ideas about traffic

## resources:
- https://news.ycombinator.com/item?id=6765029

`;

editor.getDoc().setValue(notes);


Split({
	rowCursor: 'ns-resize',
	rowGutters: [{
		track: 2,
		element: document.querySelector('.gutter-footer'),
	}],
	onDragStart: () => {
		document.documentElement.classList.add("ns-draggable-cursor");
	},
	onDragEnd: () => {
		document.documentElement.classList.remove("ns-draggable-cursor");
	}
});

function setupSideNav() {
	var elems = document.querySelectorAll('.sidenav');
	var options = {};
	var instances = M.Sidenav.init(elems, options);
}
setupSideNav();




// ----------------------------------------
// Example
// ----------------------------------------
var MAX_PARTICLES = 500;
var COLOURS = ['#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423'];
const CAR_WIDTH = 10;
var particles = [];
var pool = [];
var demo = Sketch.create({
	fullscreen: false,
	height: document.querySelector('.container.canvas').clientHeight,
	width: document.querySelector('.container.canvas').clientWidth,
	container: document.querySelector('.container.canvas'),
	retina: 'auto'
});

// ----------------------------------------
// Particle
// ----------------------------------------
function Particle(x, y, radius) {
	this.init(x, y, radius);
}
Particle.prototype = {
	init: function (x, y, radius) {
		this.alive = true;
		this.radius = radius || 10;
		this.wander = 0;
		//this.theta = random(TWO_PI);
		//this.drag = 0.92;
		//this.color = '#fff';
		this.x = x || 0.0;
		this.y = y || 0.0;
		//this.vx = 0.0;
		//this.vy = 0.0;
		const speed = random(1, 2);
		this.life = demo.height/speed;
		this.speed = speed;
	},
	move: function () {
		//this.x += this.vx;
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
		ctx.fillStyle = this.color;
		ctx.fill();
	}
};

demo.setup = function () {
	// Set off some initial particles.
	// var i, x, y;
	// for (i = 0; i < 100; i++) {
	// 	x = (demo.width * 0.5) + random(-100, 100);
	// 	y = (demo.height * 0.5) + random(-100, 100);
	// 	demo.spawn(x, y);
	// }
};
demo.spawn = function (x, y) {
	var particle, theta, force;
	if (particles.length >= MAX_PARTICLES){
		return;
		//pool.push(particles.shift());
	}
	particle = pool.length ? pool.pop() : new Particle();
	particle.init(x, y, CAR_WIDTH/2);
	//particle.wander = random(0.5, 2.0);
	particle.color = random(COLOURS);
	//particle.drag = random(0.9, 0.99);
	//theta = random(TWO_PI);
	//force = random(2, 8);
	//particle.vx = sin(theta) * force;
	//particle.vy = cos(theta) * force;
	particles.push(particle);
};
demo.update = function () {
	var i, particle;
	for (i = particles.length - 1; i >= 0; i--) {
		particle = particles[i];
		if (particle.alive) particle.move();
		else pool.push(particles.splice(i, 1)[0]);
	}
};
demo.draw = function () {
	//if(particles.length < 200){
		const DEMO_MARGIN = 450;
		for (var j = DEMO_MARGIN; j < demo.width-DEMO_MARGIN; j+=CAR_WIDTH) {
			if(random(0, 1000) > 991){
				demo.spawn(j, demo.height);
			}
		}
	//}
	demo.globalCompositeOperation = 'lighter';
	for (var i = particles.length - 1; i >= 0; i--) {
		particles[i].draw(demo);
	}
};
