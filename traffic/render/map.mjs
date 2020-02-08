
import {
    get as getCenterSettings
} from '../render/pan.mjs';

import { draw as MapChunk } from '../render/road.mjs';

function Stage(ctx, mid, width, height, chunkSize = 50) {
    //ctx.clearRect(width * -0.5, height * -0.5, ctx.width, ctx.height);
    const darkEnabled = window.localStorage.getItem('themeDark') === "true";

    ctx.fillStyle = darkEnabled ? "#090015" : "#273f0d";
    ctx.fillRect(
        mid.x, mid.y,
        width, height
    );

    return {};
}

function createOffscreenCanvas(width, height) {
    var offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = width;
    offScreenCanvas.height = height;
    // var context = offScreenCanvas.getContext("2d");
    return offScreenCanvas; //return canvas element
}

let offscreen;
const render = (offscreenCtx, ctx, stageWidth, stageHeight) => {
    const center = getCenterSettings();
    const mid = {
        x: center.x - stageWidth / 2 + ctx.width / 2,
        y: center.y - stageHeight / 2 + ctx.height / 2 + 25
    };

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
        offscreenCtx,
        mid.x,
        mid.y,
        stageWidth, stageHeight
    );
    //ctx.textAlign = "center";
    ctx.font = "100 10px small-caption";
    ctx.fillStyle = "#FFF";
    ctx.fillText(`${mid.x.toFixed(1)}\n, ${mid.y.toFixed(1)}`, 100, 100);
};

function mapDraw(ctx, stageWidth, stageHeight) {
    if(offscreen){
        render(offscreen, ctx, stageWidth, stageHeight);
        return;
    };

    offscreen = createOffscreenCanvas(stageWidth, stageHeight);
    const chunks = ctx.chunks;

    const mid = { x: 0, y: 0 };
    const _stage = Stage(offscreen.getContext("2d"), mid, stageWidth, stageHeight);
    _stage.chunks = chunks;
    _stage.chunks.forEach(ch => {
        MapChunk(offscreen.getContext("2d"), ch, mid);
    });
    ctx.stage = _stage;
    render(offscreen, ctx, stageWidth, stageHeight);

}

let carCanvas;
function carsDraw(ctx, STAGE_WIDTH, STAGE_HEIGHT) {
    const center = getCenterSettings();
    const mid = {
        x: center.x - STAGE_WIDTH / 2 + ctx.width / 2,
        y: center.y - STAGE_HEIGHT / 2 + ctx.height / 2 + 25
    };
    carCanvas = carCanvas || createOffscreenCanvas(STAGE_WIDTH, STAGE_HEIGHT);
    const carCanvasContext = carCanvas.getContext("2d");
    //carCanvasContext.fillStyle = "red";
    //ctx.fillRect(mid.x, mid.y, STAGE_WIDTH, STAGE_HEIGHT);
    carCanvasContext.clearRect(0, 0, carCanvas.width, carCanvas.height);
    ctx.particles.forEach(p => {
        p.draw(carCanvasContext, {
            x: 0,
            y: 0
        });
    });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(carCanvas, mid.x, mid.y, STAGE_WIDTH, STAGE_HEIGHT);
}

function cacheKill() {
    offscreen = undefined;
    carCanvas = undefined;
}

export default mapDraw;
export {
    cacheKill,
    carsDraw
};
