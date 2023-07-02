const SpawnPoint = function({x, y, direction, life, margin}){
	this.init(x, y, direction, life, margin);
}
SpawnPoint.prototype = {
	init: function(x, y, direction, life, margin){
		this.x = x;
		this.y = y;
		this.direction = direction;
		this.life = life;
		this.margin = margin;
	},
	emit: function(){
		if (random(0, 1000) < 970){
			return;
		}
		const lane = Math.round(random(1,2));

		let xLaneOffset = 0;
		let yLaneOffset = 0;
		if(Number(this.direction) === 270){
			xLaneOffset  = (lane-1) * 10 ;
		}
		if(Number(this.direction) === 180){
			yLaneOffset  = (lane-1) * -10;
		}
		if(Number(this.direction) === 90){
			xLaneOffset  = (lane-1) * -10 ;
		}
		if(Number(this.direction) === 0){
			yLaneOffset  = (lane-1) * 10 ;
		}
		return {
			x: this.x + xLaneOffset,
			y: this.y + yLaneOffset,
			direction: this.direction,
			lane, life: this.life, margin: this.margin
		};
	}
};

export default SpawnPoint;
