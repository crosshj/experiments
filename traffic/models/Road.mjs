function Road(x, y, lanes, laneWidth) {
    this.init(x, y, lanes, laneWidth);
}
Road.prototype = {
    init: function (x, y, lanes, laneWidth) {
        this.x = x;
        this.y = y;
        this.lanes = lanes;
        this.laneWidth = laneWidth;
    },
    draw: function (ctx, CLIENT_HEIGHT) {
        // outside lines
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, CLIENT_HEIGHT);
        const laneRightX = this.x + (this.lanes * this.laneWidth);
        ctx.moveTo(laneRightX, this.y);
        ctx.lineTo(laneRightX, CLIENT_HEIGHT);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.setLineDash([]);
        ctx.stroke();

        // lane lines
        ctx.setLineDash([3, 5.5]);
        ctx.beginPath();
        for (var l = 1; l < this.lanes; l++) {
            const lineX = this.x + l * this.laneWidth;
            ctx.moveTo(lineX, this.y);
            ctx.lineTo(lineX, CLIENT_HEIGHT);
        }
        ctx.strokeStyle = "rgba(255, 255, 0, 0.7)";
        ctx.stroke();
    }
};

export default Road;
