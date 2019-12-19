import Sketch from "https://dev.jspm.io/sketch-js/js/sketch.min.js";

function debounce(func, time){
	var time = time || 100; // 100 by default if no param
	var timer;
	return function(event){
			if(timer) clearTimeout(timer);
			timer = setTimeout(func, time, event);
	};
}

function Map(){
    const CLIENT_HEIGHT = document.querySelector('.container.canvas.map').clientHeight;
    const CLIENT_WIDTH = document.querySelector('.container.canvas.map').clientWidth;

    var demo = Sketch.create({
		interval: 1.5,
		fullscreen: false,
		height: CLIENT_HEIGHT,
		width: CLIENT_WIDTH,
		container: document.querySelector('.container.canvas.map'),
		//retina: 'auto'
    });

    // var ratio = window.devicePixelRatio || 1;

    //var c = document.querySelector('.container.canvas.map canvas');

    // c.setAttribute("width", CLIENT_WIDTH * ratio);
    // c.setAttribute("height", CLIENT_HEIGHT * ratio);

    //var ctx = c.getContext("2d");

    demo.draw = function(ctx){
        demo.font = "30px Arial";
        demo.fillStyle = "#555";
        demo.textAlign = "center";
        demo.fillText("map coming soon", demo.width/2, demo.height/2);
    }

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
