
import addChunksToStage from '../data/chunks.mjs';
import {
	get as getCenterSettings
} from '../render/pan.mjs';

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

			// indicators for road chunk rotation
			// ctx.textAlign = "center";
			// ctx.font = "100 8px serif";
			// ctx.fillStyle = "#FFF";
			// ctx.fillText(chunk.rotate || "0", chunk.width/2 -10, chunk.height/-2 + 15);
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
    const center = getCenterSettings();
    //var t0 = performance.now();
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
