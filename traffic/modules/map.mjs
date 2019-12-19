function Map(){
    var c = document.querySelector('.container.canvas.map canvas')
    var ctx = c.getContext("2d");


    ctx.font = "30px Arial";
    ctx.fillStyle = "#555";
    ctx.textAlign = "center";
    ctx.fillText("Map coming soon", c.width/2 - 75, c.height/2);

    return {
        start: () => {},
        stop: () => {}
    };
}

export default Map;
