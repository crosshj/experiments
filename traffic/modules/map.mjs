//import Sketch from "https://dev.jspm.io/sketch-js/js/sketch.min.js";
import Sketch from "../../shared/vendor/sketch.min.js";
import Particle from '../models/Particle.mjs';

import mapDraw, { cacheKill } from '../render/map.mjs';
import spawnPoints from '../data/spawnPoints.mjs';
import chunks from '../data/chunks.mjs';

/*

procedural road generation:

http://about.piwell.se/#Projects

https://stackoverflow.com/questions/48318881/generating-a-city-town-on-a-grid-simply-my-approach

https://www.redblobgames.com/x/1805-conveyor-belts/



graph:

https://www.geeksforgeeks.org/implementation-graph-javascript/



vehicle physics:

https://github.com/pakastin/car


*/

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

function mapSpawn(particle, ctx){
    const { particles, sense } = ctx;
    if(!particles){
        console.log('world has no particles set!!');
        return;
    }

    const { x, y, lane, radius = 3, direction, life, margin } = particle;

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
        ctx, x, y, lane, radius, sense, direction, life, margin
    );

    newParticle.color = random(COLOURS);
    particles.push(newParticle);
}

function mapUpdate(sketch){
    var t0 = performance.now();

    if(sketch.dragging){
        return;
    }
    const particles = sketch.particles = sketch.particles.filter(p => p.alive);
    const [LANES_COUNT, CAR_WIDTH] = [2, 10];
    for (var i = particles.length - 1; i >= 0; i--) {
        particles[i].move(LANES_COUNT, CAR_WIDTH);
    }

    function shuffle(array) {
        array.sort(() => Math.random() - 0.5);
    }
    shuffle(sketch.spawnPoints);
    sketch.spawnPoints.forEach(sp => {
        const particle = sp.emit();
        //const { x, y, lane, direction } = particle || {};
        if(particle){
            //sketch.spawn(x, y, lane, direction);
            mapSpawn(particle, sketch);
        }
    })
    var t1 = performance.now();
    //console.log("Update: " + (t1 - t0) + " milliseconds.");
}

function whichChunkContainsObserver(chunks, observer, killObserver){
    // given observer's current location:

    // if observer is within current chunk, return chunk
    const prevChunk = observer.chunk;
    const isContained = !!prevChunk
        && observer.x >= prevChunk.min.x
        && observer.y >= prevChunk.min.y
        && observer.x <= prevChunk.max.x
        && observer.y <= prevChunk.max.y;
    if(isContained){
        return prevChunk;
    }

    // if observer outside chunk, find which chunk
    const newChunk = ((chunks, o, p) => {
        if(!!p){
            const cardinal = map(o.direction);
            if(!cardinal || !p[cardinal]){
                //debugger;
            } else {
                return p[cardinal];
            }
        }
        const foundChunk = chunks.find(c => {
            return o.x >= c.min.x
                && o.y >= c.min.y
                && o.x <= c.max.x
                && o.y <= c.max.y
        });
        if(!foundChunk
            || !['curved', 'straight', 'intersect'].includes(foundChunk.type)
        ){
            killObserver();
            debugger;
        }
        //console.log(`I am in this chunk: ${foundChunk.index}`);

        return foundChunk;
    })(chunks, observer, prevChunk);

    return newChunk;

}

function sense(map, observer, view) {
    const center = getCenterSettings();
    const { particles = [], chunks } = map;
    var result = {};

    if(view === 'proximity'){
        const neighbors = particles.filter(p =>
            observer.id !== p.id &&
            (
                Math.abs(p.x - observer.x) < 30
                || Math.abs(p.y - observer.y) < 30
            )
        );
        result.neighbors = neighbors;
    }
    //console.log(map.stage.chunks[0]);

    const chunk = whichChunkContainsObserver(map.stage.chunks, {
        chunk: observer.chunk,
        x: observer.x + center.x,
        y: observer.y + center.y
    }, () => observer.alive = false);
    const lane = {};
    const ahead = {};
    const direction = 0;

    result.umvelt = {
        chunk,
        lane,
        ahead,
        center,
        direction
    };
    const observation = {
        action: view,
        result
    };
    return observation;
}

function Map() {
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
    //map.spawn = (x, y, lane, direction) => mapSpawn({ x, y, lane, direction }, map);

    //map.margin = CLIENT_WIDTH/2 + 75;
    map.spawnPoints = spawnPoints(
        CLIENT_WIDTH, CLIENT_HEIGHT,
        STAGE_WIDTH, STAGE_HEIGHT
    );
    map.chunksRefresh = () => {
        map.chunks && console.log('TODO: wish we did not have to refresh chunks here!!!');
        map.chunks = chunks(map, STAGE_WIDTH, STAGE_HEIGHT, CHUNK_SIZE);
    };
    map.chunksRefresh();


    map.update = () => mapUpdate(map);

    map.draw = () => mapDraw(map, STAGE_WIDTH, STAGE_HEIGHT);

    map.restart = () => {
        cacheKill();
        window.removeEventListener("resize", map.resizeListener);
        map.destroy();
        map = Map();
    };

    map.cacheKill = cacheKill;

    map.stop = () => {
        console.log('traffic stopped');
        map.running = false;
    }

    map.resizeListener = debounce(map.restart, 100);
    window.addEventListener("resize", map.resizeListener);

    return map;
}

export default Map;
