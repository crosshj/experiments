import Sketch from "https://dev.jspm.io/sketch-js/js/sketch.min.js";

/*

procedural road generation:

http://about.piwell.se/#Projects

https://stackoverflow.com/questions/48318881/generating-a-city-town-on-a-grid-simply-my-approach

https://www.redblobgames.com/x/1805-conveyor-belts/


*/


function debounce(func, time) {
    var time = time || 100; // 100 by default if no param
    var timer;
    return function (event) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, time, event);
    };
}

const center = {
    x: 0,
    y: 0
};

function Stage(ctx, mid, width, height, chunkSize=50){
    //ctx.clearRect(width * -0.5, height * -0.5, ctx.width, ctx.height);
    ctx.fillStyle = "#22334488";
    ctx.fillRect(
        mid.x + (width * -0.5), mid.y + (height * -0.5),
        width, height
    );
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
    const LINE_YELLOW = "#f8ca0daa";
    const LINE_YELLOW_LIGHT = "#f8ca0d22";
    ctx.save();
    ctx.translate(
        chunk.x + chunk.width/2,
        chunk.y + chunk.height/2
    );

    ctx.rotate(chunk.rotate * Math.PI/180);

    ctx.setLineDash([]);
    ctx.fillStyle = "#111";
    ctx.strokeStyle = '#777';
    const base = {
        x: chunk.width * -0.5,
        y: chunk.height * -0.5
    };
    if(chunk.type === "straight"){
        ctx.fillRect(
            base.x,
            base.y + 5,
            chunk.width, chunk.height -10
        );
        ctx.strokeStyle = LINE_YELLOW;
        ctx.beginPath();
        ctx.setLineDash([0, 5, 10, 10]);
        ctx.moveTo(base.x, base.y + chunk.height/2);
        ctx.lineTo(base.x + chunk.width, base.y + chunk.height/2);
        ctx.stroke();
    }

    if(chunk.type === "curved"){
        ctx.beginPath();
        ctx.moveTo(base.x, base.y + 5);
        ctx.quadraticCurveTo(
            base.x + chunk.width -5, base.y + 5,
            base.x + chunk.width -5, base.y + chunk.height
        );
        ctx.lineTo(base.x + 5, base.y + chunk.height);
        ctx.quadraticCurveTo(
            base.x + 5, base.y + chunk.height - 5,
            base.x, base.y + chunk.height - 5
        );

        ctx.fill();

        ctx.strokeStyle = LINE_YELLOW;
        ctx.beginPath();
        ctx.setLineDash([0,3, 10, 10]);
        ctx.moveTo(base.x, base.y + chunk.height/2);
        ctx.quadraticCurveTo(
            base.x + chunk.width/2, base.y + chunk.height/2,
            base.x + chunk.width/2, base.y + chunk.height
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

        ctx.strokeStyle = LINE_YELLOW_LIGHT;
        ctx.beginPath();
        ctx.setLineDash([0,5, 2,3, 2,3, 2,3, 2,3, 2,3, 2,3, 2,3]);
        ctx.moveTo(base.x + 5, base.y + 5);
        ctx.lineTo(base.x + chunk.width - 5, base.y + 5);

        ctx.lineTo(base.x + chunk.width - 5, base.y + chunk.height-5);
        ctx.lineTo(base.x + 5, base.y + chunk.height-5);
        ctx.lineTo(base.x + 5, base.y + 5);
        ctx.lineWidth = "7";
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

        ctx.strokeStyle = LINE_YELLOW_LIGHT;
        ctx.beginPath();
        ctx.setLineDash([0,5, 2,3, 2,3, 2,3, 2,3, 2,3, 2,3, 2,3]);
        ctx.moveTo(base.x + 5, base.y + 5);
        ctx.lineTo(base.x + chunk.width - 5, base.y + 5);

        ctx.lineTo(base.x + chunk.width - 5, base.y + chunk.height-5);
        ctx.lineTo(base.x + 5, base.y + chunk.height-5);
        ctx.lineWidth = "7";
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

    ctx.textAlign = "center";
    ctx.font = "12px Monospace";
    ctx.fillStyle = "#555";
    ctx.fillText(chunk.index, chunk.x+chunkSize/2, chunk.y+chunkSize/2);
    return;

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

function mapDraw(ctx, stageWidth, stageHeight){
    const mid = {
        x: center.x + ctx.width / 2,
        y: center.y + ctx.height / 2
    };
    const _stage = Stage(ctx, mid,  stageWidth, stageHeight);

    ctx.font = "30px Arial";
    ctx.fillStyle = "#555";
    ctx.textAlign = "center";

    ctx.fillText("map in progress", mid.x, mid.y+30);

    _stage.chunks[0].type = 'straight';

    _stage.chunks[1].type = 'straight';
    //_stage.chunks[1].rotate = 90;

    _stage.chunks[2].type = 'curved';

    // _stage.chunks[3].type = 'curved';
    // _stage.chunks[3].rotate = 90;

    _stage.chunks[4].type = "straight";
    _stage.chunks[4].rotate = 90;


    // _stage.chunks[4].type = 'intersect';
    // _stage.chunks[4].degree = 4;

    // _stage.chunks[5].type = 'intersect';
    // _stage.chunks[5].degree = 3;

    // _stage.chunks[6].type = 'intersect';
    // _stage.chunks[6].degree = 3;
    // _stage.chunks[6].rotate = 90;

    _stage.chunks[18].type = 'straight';
    _stage.chunks[18].rotate = 90;

    _stage.chunks[20].type = 'straight';
    _stage.chunks[20].rotate = 90;

    _stage.chunks[34].type = 'curved';
    _stage.chunks[34].rotate = -180;

    _stage.chunks[35].type = 'intersect';
    _stage.chunks[35].degree = 3;
    _stage.chunks[35].rotate = 90;

    _stage.chunks[36].type = 'curved';
    _stage.chunks[36].rotate = 90;

    _stage.chunks[50].type = 'curved';
    _stage.chunks[50].rotate = -90;

    _stage.chunks[51].type = 'curved';
    _stage.chunks[51].rotate = 90;

    _stage.chunks[66].type = 'straight';
    _stage.chunks[66].rotate = 90;

    _stage.chunks[82].type = 'intersect';
    _stage.chunks[82].degree = 4;


    (new Array(11)).fill().forEach((x, i) => {
        _stage.chunks[80+i].type = 'straight';
    });
    _stage.chunks[82].type = 'intersect';
    _stage.chunks[82].degree = 4;

    _stage.chunks[88].type = 'intersect';
    _stage.chunks[88].degree = 3;
    _stage.chunks[88].rotate = -90;
    (new Array(5)).fill().forEach((x, i) => {
        _stage.chunks[8+i*16].type = 'straight';
        _stage.chunks[8+i*16].rotate = 90;
    });

    (new Array(6)).fill().forEach((x, i) => {
        _stage.chunks[98+i*16].type = 'straight';
        _stage.chunks[98+i*16].rotate = 90;
    });
    _stage.chunks[91].type = 'straight';
    _stage.chunks[92].type = 'straight';
    _stage.chunks[93].type = 'curved';

    (new Array(6)).fill().forEach((x, i) => {
        _stage.chunks[109+i*16].type = 'straight';
        _stage.chunks[109+i*16].rotate = 90;

    });

    _stage.chunks.forEach(ch =>
        MapChunk(ctx, ch)
    );
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
}

function Map() {
    const CLIENT_HEIGHT = document.querySelector('.container.canvas.map').clientHeight;
    const CLIENT_WIDTH = document.querySelector('.container.canvas.map').clientWidth;
    const [STAGE_WIDTH, STAGE_HEIGHT] = [800, 600];

    var demo = Sketch.create({
        interval: 1.5,
        fullscreen: false,
        height: CLIENT_HEIGHT,
        width: CLIENT_WIDTH,
        container: document.querySelector('.container.canvas.map'),
        touchmove: () => mapTouchMove.bind(demo)(STAGE_WIDTH, STAGE_HEIGHT)
        //retina: 'auto'
    });

    demo.draw = () => mapDraw(demo, STAGE_WIDTH, STAGE_HEIGHT);

    demo.restart = () => {
        window.removeEventListener("resize", demo.resizeListener);
        demo.destroy();
        demo = Map();
    };

    demo.resizeListener = debounce(demo.restart, 100);
    window.addEventListener("resize", demo.resizeListener);

    return demo;
}

export default Map;
