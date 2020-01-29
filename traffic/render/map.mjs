
import {
	get as getCenterSettings
} from '../render/pan.mjs';

import { draw as MapChunk } from '../render/road.mjs';

function Stage(ctx, mid, width, height, chunkSize=50){
	//ctx.clearRect(width * -0.5, height * -0.5, ctx.width, ctx.height);
	const darkEnabled = window.localStorage.getItem('themeDark') === "true";

	ctx.fillStyle = darkEnabled ? "#090015" : "#273f0d";
	ctx.fillRect(
			mid.x, mid.y,
			width, height
	);

	return {};
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
