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
    ctx.fillStyle = "#22334455";
    ctx.fillRect(
        mid.x + (width * -0.5), mid.y + (height * -0.5),
        width, height
    );
    const chunks = [];


    for (var y=0; y < height; y += chunkSize){
        for (var x=0; x < width; x += chunkSize){
            chunks.push({
                x: mid.x + (width * -0.5) + x,
                y: mid.y + (height * -0.5) + y
            });
        }
    }

    return { chunks };
}

function drawRoadChunk(ctx, chunk){
    const LINE_YELLOW = "#f8ca0daa";
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

function mapDraw(ctx){
    const mid = {
        x: center.x + ctx.width / 2,
        y: center.y + ctx.height / 2
    };
    const _stage = Stage(ctx, mid,  800, 600);

    ctx.font = "30px Arial";
    ctx.fillStyle = "#555";
    ctx.textAlign = "center";

    ctx.fillText("map coming soon", mid.x, mid.y);

    ctx.setLineDash([]);
    ctx.fillStyle = "#111";
    ctx.strokeStyle = '#777';
    ctx.fillRect(
        mid.x - 100,
        mid.y + 30, 200, 40
    );

    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    ctx.setLineDash([10, 15]);
    ctx.moveTo(mid.x - 100 + 5, mid.y + 30 + 20);
    ctx.lineTo(mid.x - 100 + 200, mid.y + 30 + 20);
    ctx.stroke();

    _stage.chunks[0].type = 'straight';

    _stage.chunks[1].type = 'straight';
    _stage.chunks[1].rotate = 90;

    _stage.chunks[2].type = 'curved';

    _stage.chunks[3].type = 'curved';
    _stage.chunks[3].rotate = 90;

    _stage.chunks[4].type = 'intersect';
    _stage.chunks[4].degree = 4;

    _stage.chunks[5].type = 'intersect';
    _stage.chunks[5].degree = 3;

    _stage.chunks[6].type = 'intersect';
    _stage.chunks[6].degree = 3;
    _stage.chunks[6].rotate = 90;

    _stage.chunks[18].type = 'straight';
    _stage.chunks[18].rotate = 90;

    _stage.chunks[20].type = 'straight';
    _stage.chunks[20].rotate = 90;

    _stage.chunks[34].type = 'curved';
    _stage.chunks[34].rotate = -180;

    _stage.chunks[35].type = 'straight';

    _stage.chunks[36].type = 'curved';
    _stage.chunks[36].rotate = 90;

    _stage.chunks.forEach(ch =>
        MapChunk(ctx, ch)
    );
}

function mapTouchMove(){
    if(!this.dragging){
        return;
    }
    center.x += this.touches[0].dx;
    center.y += this.touches[0].dy;
    //console.log(this.touches);
}

function Map() {
    const CLIENT_HEIGHT = document.querySelector('.container.canvas.map').clientHeight;
    const CLIENT_WIDTH = document.querySelector('.container.canvas.map').clientWidth;

    var demo = Sketch.create({
        interval: 1.5,
        fullscreen: false,
        height: CLIENT_HEIGHT,
        width: CLIENT_WIDTH,
        container: document.querySelector('.container.canvas.map'),
        touchmove: mapTouchMove
        //retina: 'auto'
    });

    demo.draw = () => mapDraw(demo);

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
