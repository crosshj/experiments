import Sketch from "../../shared/vendor/sketch.min.js";
import Particle from '../models/Particle.mjs';

import mapDraw, { cacheKill, carsDraw } from '../render/map.mjs';

import chunks from '../data/chunks.mjs';

import sense from './sense.mjs';
import { distance, debounce } from './utilities.mjs';
import {
    set as setCenterSettings,
    get as getCenterSettings
} from '../render/pan.mjs';

const MAX_PARTICLES = 100;

const COLOURS = [
    '#69D2E7', //blue
    '#A7DBD8', //lightblue
    '#E0E4CC', //lightyellow
    '#f7ac73', //lightorange
    '#B794F7', //purple
    '#86C58B', //lightgreen
    '#A37666' //lightbrown
];

const init = () => {
	window.DEBUG_CHUNK = true;
	window.DEBUG = true;
	window.DEBUG_CAR = 1;
};

let index=6;
const life = 999999;
const speed= 1;
const particle = () => {
	const testCars = [{
		x:  90, y:  31, direction:   0,	lane: 1, life, speed,
		name: "left top row"
	}, {
		x: 640, y: 281, direction:   0, lane: 1, life, speed,
		name: "left middle row"
	}, {
		x: 131, y: 210, direction: 270, lane: 1, life, speed,
		name: "bottom left column"
	}, {
		x: 481, y: 420, direction: 270, lane: 1, life, speed,
		name: "bottom middle column - inner lane"
	}, {
		x: 491, y: 450, direction: 270, lane: 2, life, speed,
		name: "bottom middle column - outer lane"
	}, {
		x: 681, y: 800, direction: 270, lane: 1, life, speed,
		name: "bottom swirly"
	},{
		x: 400, y: 120, direction: 180, lane: 2, life, speed,
		name: "right row - inner lane"
	}, {
		x: 400, y: 110, direction: 180, lane: 2, life, speed,
		name: "right row - outer lane"
	}, {
		x:   219, y:  0, direction:  90, lane: 2, life, speed,
		name: "left top column - inner lane"
	}, {
		x:   209, y:  0, direction:  90, lane: 2, life, speed,
		name: "left top column - outer lane"
	}];
	// while([5].includes(index)){
	// 	index++;
	// }
	if(index >= testCars.length){
		index = 0;
	}
	if(!testCars.length){
		debugger;
	}
	console.log(`-- Test run: ${testCars[window.DEBUG_CAR] ? window.DEBUG_CAR : index}`);
	return testCars[window.DEBUG_CAR] || testCars[index++];

};

function mapSpawn(particle, ctx){
	const { particles, sense } = ctx;
	if(!particles){
			console.log('world has no particles set!!');
			return;
	}

	const { x, y, lane, radius = 3, direction, life, speed } = particle;
	const tooClose = particles.find(p => {
			const dist = distance({x, y}, p);
			return dist < 10;
	});
	if(tooClose){
			//console.log('will not spawn particle too close');
			return;
	}

	if (particles.length >= MAX_PARTICLES) {
			return;
	}
	const newParticle = new Particle(
			ctx, x, y, lane, radius, sense, direction, life, null, speed
	);

	newParticle.color = random(COLOURS);
	particles.push(newParticle);
	return newParticle;
}

const spawnPoints = () => [];

const mapUpdate = (sketch) => {
	if(sketch.dragging){
		return;
	}

	const particles = sketch.particles = sketch.particles.filter(p => p.alive);
	const [LANES_COUNT, CAR_WIDTH] = [2, 10];
	for (var i = particles.length - 1; i >= 0; i--) {
			particles[i].move(LANES_COUNT, CAR_WIDTH);
	}

	if(particles.length){
		return;
	}
	 mapSpawn(particle(), sketch);
};

function mapTouchMove(width, height){
	if(!this.dragging){
			return;
	}

	const center = getCenterSettings();
	center.x += this.touches[0].dx;
	center.y += this.touches[0].dy;

	if(center.x < -0.25* width){
			center.x = -0.25* width;
	}
	if(center.x > 0.25* width){
			center.x = 0.25* width;
	}
	if(center.y < -0.25* height){
			center.y = -0.25* height;
	}
	if(center.y > 0.25* height){
			center.y = 0.25* height;
	}
	setCenterSettings(center);
	cacheKill();
	this.chunksRefresh();
}

function Test(){
	init();

	const CLIENT_HEIGHT = document.querySelector('.container.canvas.map').clientHeight;
	const CLIENT_WIDTH = document.querySelector('.container.canvas.map').clientWidth;
	const [STAGE_WIDTH, STAGE_HEIGHT, CHUNK_SIZE] = [800, 800, 50];

	var map = Sketch.create({
			interval: 1,
			fullscreen: false,
			height: CLIENT_HEIGHT,
			width: CLIENT_WIDTH,
			container: document.querySelector('.container.canvas.map'),
			touchmove: () => mapTouchMove.bind(map)(STAGE_WIDTH, STAGE_HEIGHT)
			//retina: 'auto'
	});
	map.particles = [];
	map.sense = (observer, view) => sense(map, observer, view);
	map.CLIENT_WIDTH = CLIENT_WIDTH;
	map.CLIENT_HEIGHT = CLIENT_HEIGHT;

	map.spawnPoints = spawnPoints();

	map.chunksRefresh = () => {
			map.chunks && console.log('TODO: wish we did not have to refresh chunks here!!!');
			map.chunks = chunks(map, STAGE_WIDTH, STAGE_HEIGHT, CHUNK_SIZE);
	};
	map.chunksRefresh();

	map.update = () => mapUpdate(map);

	map.draw = () => {
			mapDraw(map, STAGE_WIDTH, STAGE_HEIGHT);
			carsDraw(map, STAGE_WIDTH, STAGE_HEIGHT);
	};

	map.restart = () => {
			cacheKill();
			window.removeEventListener("resize", map.resizeListener);
			map.destroy();
			map = new Map();
	};

	map.cacheKill = cacheKill;

	map.stop = () => {
			console.log('traffic stopped');
			map.running = false;
	}

	map.resizeListener = debounce(map.restart, 100);
	window.addEventListener("resize", map.resizeListener);

	//map.scale(3,3)
	return map;
}

export default Test;
