
import {
	get as getCenterSettings
} from '../render/pan.mjs';

import { draw as MapChunk } from '../render/road.mjs';

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
	return {};
}

function populationDraw(ctx){
	const { particles = []} = ctx;
	const center = getCenterSettings();

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
		const chunks = ctx.chunks;
		const center = getCenterSettings();
    //var t0 = performance.now();
    //first draw (and hard redraw, ie. touchmove)
    if(!backgroundCache){
        const mid = {
            x: center.x - stageWidth / 2 + ctx.width / 2,
            y: center.y - stageHeight / 2 + ctx.height / 2 + 25
        };
				const _stage = Stage(ctx, mid,  stageWidth, stageHeight);

				_stage.chunks = chunks;
        _stage.chunks.forEach(ch => {
            MapChunk(ctx, ch, mid);
        });
        ctx.stage = _stage;
        backgroundCache = ctx.getImageData(0,0,ctx.width,ctx.height);
    } else {
       ctx.putImageData(backgroundCache, 0, 0);
    }
    populationDraw(ctx);
    //var t1 = performance.now();
    //console.log("Draw: " + (t1 - t0) + " milliseconds.");
}

function  cacheKill(){
	backgroundCache = undefined;
}

export default mapDraw;
export {
	cacheKill
};
