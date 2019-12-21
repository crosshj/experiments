import Sketch from "https://dev.jspm.io/sketch-js/js/sketch.min.js";

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
    ctx.fillStyle = "#223344aa";
    ctx.fillRect(0, 0, ctx.width, ctx.height);

    ctx.font = "30px Arial";
    ctx.fillStyle = "#555";
    ctx.textAlign = "center";
    ctx.fillText("map coming soon", center.x + ctx.width / 2, center.y + ctx.height / 2);
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
