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

function mapDraw(ctx){
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.fillStyle = "#223344aa";
    ctx.fillRect(0, 0, ctx.width, ctx.height);

    ctx.font = "30px Arial";
    ctx.fillStyle = "#555";
    ctx.textAlign = "center";

    const mid = {
        x: center.x + ctx.width / 2,
        y: center.y + ctx.height / 2
    };

    ctx.fillText("map coming soon", mid.x, mid.y);

    ctx.setLineDash([]);
    ctx.fillStyle = "#111";
    ctx.strokeStyle = '#777';
    ctx.fillRect(
        mid.x - 100,
        mid.y + 30, 200, 40
    );
    // ctx.strokeRect(
    //     mid.x - 100,
    //     mid.y + 30, 200, 40
    // );

    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    ctx.setLineDash([10, 15]);
    ctx.moveTo(mid.x - 100 + 5, mid.y + 30 + 20);
    ctx.lineTo(mid.x - 100 + 200, mid.y + 30 + 20);
    ctx.stroke();


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
