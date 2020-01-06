//import Sketch from "https://dev.jspm.io/sketch-js/js/sketch.min.js";
import Sketch from "../../shared/vendor/sketch.min.js";

import Particle from '../models/Particle.mjs';
import SpawnPoint from '../models/SpawnPoint.mjs';

import addChunksToStage from './chunks.mjs';

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

const MAX_PARTICLES = 100;

var COLOURS = [
    '#69D2E7', //blue
    '#A7DBD8', //lightblue
    '#E0E4CC', //lightyellow
    '#f7ac73', //lightorange
    '#B794F7', //purple
    '#86C58B', //lightgreen
    '#A37666' //lightbrown
];

const centerSettings = window.localStorage.getItem('mapCenter');

const center = centerSettings
    ? JSON.parse(centerSettings)
    : {
        x: 0,
        y: 0
    };
const setCenterSettings = (settings) => {
    window.localStorage.setItem(
        'mapCenter',
        JSON.stringify(settings)
    );
};

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

function Stage(ctx, mid, width, height, chunkSize=50){
    //ctx.clearRect(width * -0.5, height * -0.5, ctx.width, ctx.height);
    const darkEnabled = window.localStorage.getItem('themeDark') === "true";
    if(!darkEnabled){
        ctx.fillStyle = "#273f0d";
        ctx.fillRect(
            mid.x + (width * -0.5), mid.y + (height * -0.5),
            width, height
        );
    }
    const chunks = [];

    var index = 0;
    for (var y=0; y < height; y += chunkSize){
        for (var x=0; x < width; x += chunkSize){
            chunks.push({
                index,
                x: mid.x + (width * -0.5) + x,
                y: mid.y + (height * -0.5) + y
            });
            index += 1;
        }
    }

    return { chunks };
}

function drawRoadChunk(ctx, chunk){
    //TODO: this is where center offset should occur (instead it's being included in chunk object)
    const LINE_BROKEN = [3, 4];
    const LINE_BROKEN_CURVE = [4, 3];//[0, 7, 10, 10];
    const LINE_YELLOW = "#f8ca0d";
    const LINE_YELLOW_LIGHT = "#f8ca0d22";
    const LINE_WHITE = "#ffffff";
    const LINE_WHITE_LIGHT = "#888";
    const ROAD_COLOR = "#222";

    const piOver180 = 0.01745329252;


    ctx.save();
    ctx.translate(
        chunk.x + chunk.width/2,
        chunk.y + chunk.height/2
    );

    ctx.rotate(chunk.rotate * Math.PI/180);

    ctx.setLineDash([]);
    ctx.fillStyle = ROAD_COLOR;
    ctx.strokeStyle = '#777';
    const base = {
        x: chunk.width * -0.5,
        y: chunk.height * -0.5
    };
    if(chunk.type === "straight"){
        ctx.fillRect(
            base.x-1,
            base.y + 5,
            chunk.width+1, chunk.height -10
        );
        // center lane lines
        ctx.lineWidth = "0.8";
        ctx.strokeStyle = LINE_YELLOW;
        ctx.beginPath();
        ctx.moveTo(base.x-1, base.y + chunk.height/2+1.2);
        ctx.lineTo(base.x + chunk.width+1, base.y + chunk.height/2+1.2);
        ctx.moveTo(base.x-1, base.y + chunk.height/2-1.2);
        ctx.lineTo(base.x + chunk.width+1, base.y + chunk.height/2-1.2);
        ctx.stroke();
        ctx.lineWidth = "1";

        //lower lanes dashed
        ctx.beginPath();
        ctx.strokeStyle = LINE_WHITE;
        ctx.setLineDash(LINE_BROKEN);
        ctx.moveTo(base.x, base.y + chunk.height/2 + 10);
        ctx.lineTo(base.x + chunk.width, base.y + chunk.height/2 + 10);
        ctx.stroke();

        //upper lanes dashed
        ctx.beginPath();
        ctx.strokeStyle = LINE_WHITE;
        ctx.setLineDash(LINE_BROKEN);
        ctx.moveTo(base.x, base.y + chunk.height/2 - 10);
        ctx.lineTo(base.x + chunk.width, base.y + chunk.height/2 - 10);
        ctx.stroke();

        // border lines
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = LINE_WHITE;
        ctx.moveTo(base.x, base.y + chunk.height - 4);
        ctx.lineTo(base.x + chunk.width, base.y + chunk.height - 4);
        ctx.moveTo(base.x, base.y + 4);
        ctx.lineTo(base.x + chunk.width, base.y + 4);
        ctx.stroke();
    }

    if(chunk.type === "curved"){
        ctx.beginPath();
        ctx.moveTo(base.x-1, base.y + 5);
        // ctx.quadraticCurveTo(
        //     base.x + chunk.width -5, base.y + 5,
        //     base.x + chunk.width -5, base.y + chunk.height +1
        // );
        ctx.arc(base.x, base.y + chunk.height , 45, -90*piOver180, 0,  false);
        ctx.lineTo(base.x, base.y + chunk.height);
        ctx.quadraticCurveTo(
            base.x + 5, base.y + chunk.height - 5,
            base.x-1, base.y + chunk.height - 5
        );
        ctx.fill();

        // center lane lines
        ctx.lineWidth = "0.8";
        ctx.strokeStyle = LINE_YELLOW;
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.moveTo(base.x-1, base.y + chunk.height/2 -1.2);
        ctx.quadraticCurveTo(
            base.x + chunk.width/2+1, base.y + chunk.height/2,
            base.x + chunk.width/2+1.2, base.y + chunk.height+0.5
        );
        ctx.moveTo(base.x-1, base.y + chunk.height/2 +1.2);
        ctx.quadraticCurveTo(
            base.x + chunk.width/2-1, base.y + chunk.height/2+2,
            base.x + chunk.width/2-1.2, base.y + chunk.height+0.5
        );
        ctx.stroke();
        ctx.lineWidth = "1";

        // outer lanes dashed
        ctx.beginPath();
        ctx.strokeStyle = LINE_WHITE;
        ctx.setLineDash(LINE_BROKEN);
        ctx.moveTo(base.x, base.y + chunk.height/2 -10);
        ctx.quadraticCurveTo(
            base.x + chunk.width/2+10, base.y + chunk.height/2 -7,
            base.x + chunk.width/2+10, base.y + chunk.height
        );
        ctx.stroke();

        // inner lanes dashed
        ctx.beginPath();
        ctx.strokeStyle = LINE_WHITE;

        ctx.setLineDash(LINE_BROKEN_CURVE);
        ctx.moveTo(base.x, base.y + chunk.height/2 +10);
        ctx.quadraticCurveTo(
            base.x + chunk.width/2-10, base.y + chunk.height/2 +11,
            base.x + chunk.width/2-10, base.y + chunk.height
        );
        ctx.stroke();

        // outer lane border
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = LINE_WHITE;
        ctx.moveTo(base.x, base.y + 4);
        // ctx.quadraticCurveTo(
        //     base.x + chunk.width -4, base.y + 5,
        //     base.x + chunk.width -4, base.y + chunk.height
        // );
        ctx.arc(base.x, base.y + chunk.height , 46, -90*piOver180, 0,  false);
        ctx.stroke();

        // inner lane border
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = LINE_WHITE;
        ctx.moveTo(base.x + 4, base.y + chunk.height);
        ctx.quadraticCurveTo(
            base.x + 5, base.y + chunk.height - 5,
            base.x-1, base.y + chunk.height - 4
        );
        ctx.stroke();
    }

    if(chunk.type === "intersect" && Number(chunk.degree) === 4){
        ctx.fillRect(
            base.x,
            base.y + 5,
            chunk.width, chunk.height -10
        );
        ctx.fillRect(
            base.x + 5,
            base.y,
            chunk.width - 10, chunk.height
        );

        ctx.strokeStyle = LINE_WHITE_LIGHT;
        ctx.beginPath();
        ctx.setLineDash([0,5, 2,3, 2,3, 2,3, 2,3, 2,3, 2,3, 2,3]);
        ctx.moveTo(base.x + 5, base.y + 5);
        ctx.lineTo(base.x + chunk.width - 5, base.y + 5);

        ctx.lineTo(base.x + chunk.width - 5, base.y + chunk.height-5);
        ctx.lineTo(base.x + 5, base.y + chunk.height-5);
        ctx.lineTo(base.x + 5, base.y + 5);
        ctx.lineWidth = "7";
        ctx.stroke();

        // left lower lane border
        ctx.lineWidth = "1";
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = LINE_WHITE;
        ctx.moveTo(base.x + 4, base.y + chunk.height);
        ctx.quadraticCurveTo(
            base.x + 5, base.y + chunk.height - 5,
            base.x-1, base.y + chunk.height - 4
        );
        ctx.stroke();

        // right lower lane border
        ctx.lineWidth = "1";
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = LINE_WHITE;
        ctx.moveTo(base.x + chunk.width -4, base.y + chunk.height);
        ctx.quadraticCurveTo(
            base.x + chunk.width -4, base.y + chunk.height - 4,
            base.x + chunk.width, base.y + chunk.height - 4
        );
        ctx.stroke();

        // left upper lane border
        ctx.lineWidth = "1";
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = LINE_WHITE;
        ctx.moveTo(base.x + 4, base.y);
        ctx.quadraticCurveTo(
            base.x + 4, base.y + 4,
            base.x, base.y + 4
        );
        ctx.stroke();

        // right upper lane border
        ctx.lineWidth = "1";
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = LINE_WHITE;
        ctx.moveTo(base.x + chunk.width -4, base.y);
        ctx.quadraticCurveTo(
            base.x + chunk.width -4, base.y + 4,
            base.x + chunk.width, base.y + 4
        );
        ctx.stroke();
    }

    if(chunk.type === "intersect" && Number(chunk.degree) === 3){
        ctx.fillRect(
            base.x + 5,
            base.y + 5,
            chunk.width-5, chunk.height -10
        );
        ctx.fillRect(
            base.x + 5,
            base.y,
            chunk.width - 10, chunk.height
        );

        ctx.strokeStyle = LINE_WHITE_LIGHT;
        ctx.beginPath();
        ctx.setLineDash([0,5, 2,3, 2,3, 2,3, 2,3, 2,3, 2,3, 2,3]);
        ctx.moveTo(base.x + 5, base.y + 5);
        ctx.lineTo(base.x + chunk.width - 5, base.y + 5);

        ctx.lineTo(base.x + chunk.width - 5, base.y + chunk.height-5);
        ctx.lineTo(base.x + 5, base.y + chunk.height-5);
        ctx.lineWidth = "7";
        ctx.stroke();

        // straight border lines
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.lineWidth = "1";
        ctx.strokeStyle = LINE_WHITE;
        ctx.moveTo(base.x+4, base.y);
        ctx.lineTo(base.x+4, base.y + chunk.height);
        ctx.stroke();

        // right lower lane border
        ctx.lineWidth = "1";
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = LINE_WHITE;
        ctx.moveTo(base.x + chunk.width -4, base.y + chunk.height);
        ctx.quadraticCurveTo(
            base.x + chunk.width -4, base.y + chunk.height - 4,
            base.x + chunk.width, base.y + chunk.height - 4
        );
        ctx.stroke();

        // right upper lane border
        ctx.lineWidth = "1";
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = LINE_WHITE;
        ctx.moveTo(base.x + chunk.width -4, base.y);
        ctx.quadraticCurveTo(
            base.x + chunk.width -4, base.y + 4,
            base.x + chunk.width, base.y + 4
        );
        ctx.stroke();

    }

    ctx.restore();
}

function MapChunk(ctx, chunk, chunkSize=50){
    const { x, y, type } = chunk;
    ctx.setLineDash([]);
    ctx.lineWidth = "1";

    if(type){
        //console.log(chunk);
        drawRoadChunk(ctx, { ...chunk, ...{ width: chunkSize, height: chunkSize }});
        return;
    }
    return;
    // text label for chunk index
    ctx.textAlign = "center";
    ctx.font = "12px Monospace";
    ctx.fillStyle = "#555";
    ctx.fillText(chunk.index, chunk.x+chunkSize/2, chunk.y+chunkSize/2);

    //return;
    //bottom-right border
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(x, y+chunkSize-1);
    ctx.lineTo(x+chunkSize-1, y+chunkSize-1);
    ctx.lineTo(x+chunkSize-1, y);
    ctx.stroke();

    //left-top border
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(x, y+chunkSize-1);
    ctx.lineTo(x, y);
    ctx.lineTo(x+chunkSize-1, y);
    ctx.stroke();


}

function populationDraw(ctx){
    const { particles = []} = ctx;


    //TODO: troubleshoot issues with cars too close to each other
    //console.log(particles[0]);
    // const distanceGraph = {};
    // particles.forEach(p => {
    //     particles.forEach(other => {
    //         if(other.id === p.id){ return; }
    //         if(distanceGraph[`${other.id}-${p.id}`]){ return; }
    //         if(distanceGraph[`${p.id}-${other.id}`]){ return; }

    //         const dist = distance(other, p);
    //         if(dist < 5){
    //             debugger;
    //         }
    //         distanceGraph[`${p.id}-${other.id}`] = dist;
    //         distanceGraph[`${other.id}-${p.id}`] = dist;
    //     });
    // });
    //const firstKey = Object.keys(distanceGraph)[0];
    //console.log(distanceGraph[firstKey]);

    for (var i = particles.length - 1; i >= 0; i--) {
        particles[i].draw(ctx, {
            x: center.x,
            y: center.y
        });
    }
}

let backgroundCache;
function mapDraw(ctx, stageWidth, stageHeight){
    //first draw (and hard redraw, ie. touchmove)
    if(!backgroundCache){
        const mid = {
            x: center.x + ctx.width / 2,
            y: center.y + ctx.height / 2 +25
        };
        const _stage = Stage(ctx, mid,  stageWidth, stageHeight);
        _stage.chunks = addChunksToStage(_stage).chunks;

        const chunkSize = 50;
        _stage.chunks.forEach(ch => {
            ch.min = {
                x: ch.x,
                y: ch.y
            };
            ch.max = {
                x: ch.x + chunkSize,
                y: ch.y + chunkSize
            };
            MapChunk(ctx, ch, chunkSize);
        });
        ctx.stage = _stage;
        backgroundCache = ctx.getImageData(0,0,ctx.width,ctx.height);
    } else {
       ctx.putImageData(backgroundCache, 0, 0);
    }
    populationDraw(ctx);
}

function mapTouchMove(width, height){
    if(!this.dragging){
        return;
    }
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
    backgroundCache = undefined;
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
}

function whichChunkContainsObserver(chunks, observer){
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
    const getCardinal = (dir) => ({
        0: 'east',
        90: 'south',
        180: 'west',
        270: 'north'
    }[dir]);
    const getInverseCardinal = (dir) => ({
        0: 'west',
        90: 'north',
        180: 'east',
        270: 'south'
    }[dir]);

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
        if(!foundChunk){
            //debugger;
        }
        //console.log(`I am in this chunk: ${foundChunk.index}`);

        return foundChunk;
    })(chunks, observer, prevChunk);

    if(!!prevChunk && !!newChunk){
        const cd = getCardinal(observer.direction);
        const invCd = getInverseCardinal(observer.direction);
        if(!chunks[prevChunk.index][cd]){
            //console.log(`there was a previous chunk, update cardinals ${cd}`);
            chunks[prevChunk.index][cd] = chunks[newChunk.index];
        }
        if(!chunks[newChunk.index][invCd]){
            //console.log(`there was a previous chunk, update cardinals ${invCd}`);
            chunks[newChunk.index][invCd] = chunks[prevChunk.index];
        }
    }
    return newChunk;

}

function sense(map, observer, view) {
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
    });
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
    const [STAGE_WIDTH, STAGE_HEIGHT] = [800, 800];

    var map = Sketch.create({
        interval: 1.5,
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
    map.spawnPoints = [
        //1st column
        new SpawnPoint({
            x: CLIENT_WIDTH/2 - STAGE_WIDTH/2 +130.5,
            y: CLIENT_HEIGHT/2 + STAGE_HEIGHT/2 + 25,
            life: 400,
            margin: CLIENT_WIDTH/2 - STAGE_WIDTH/2 + 125.5,
            direction: 270
        }),

        //2nd column
        new SpawnPoint({
            x: CLIENT_WIDTH/2 + 80.5,
            y: CLIENT_HEIGHT/2 + STAGE_HEIGHT/2 + 25,
            life: 400,
            margin: CLIENT_WIDTH/2 + 75,
            direction: 270
        }),

        // 3rd column
        new SpawnPoint({
            x: CLIENT_WIDTH/2 + STAGE_WIDTH/2 -120,
            y: CLIENT_HEIGHT/2 + STAGE_HEIGHT/2 + 25,
            life: 1200,
            margin: CLIENT_WIDTH/2 + STAGE_WIDTH/2 - 125,
            direction: 270
        }),

        // TOP column
        new SpawnPoint({
            x: CLIENT_WIDTH/2 + 19,
            y: CLIENT_HEIGHT/2 - STAGE_HEIGHT/2 +25,
            life: 100,
            margin: CLIENT_WIDTH/2 + STAGE_WIDTH/2 - 125,
            direction: 90
        }),

        // horizontal - left
        new SpawnPoint({
            x: CLIENT_WIDTH/2 - STAGE_WIDTH/2,
            y: CLIENT_HEIGHT/2 - STAGE_HEIGHT/2 + 25 + 280,
            life: 300,
            direction: 0
        }),
        // horizontal - right
        new SpawnPoint({
            x: CLIENT_WIDTH/2 + STAGE_WIDTH/2,
            y: CLIENT_HEIGHT/2 - STAGE_HEIGHT/2 + 25 + 120,
            life: 350,
            direction: 180
        })
    ];

    map.update = () => mapUpdate(map);

    map.draw = () => mapDraw(map, STAGE_WIDTH, STAGE_HEIGHT);

    map.restart = () => {
        backgroundCache = undefined;
        window.removeEventListener("resize", map.resizeListener);
        map.destroy();
        map = Map();
    };

    map.stop = () => {
        console.log('traffic stopped');
        map.running = false;;
    }

    map.resizeListener = debounce(map.restart, 100);
    window.addEventListener("resize", map.resizeListener);

    return map;
}

export default Map;
