/*

currently, car's coordinates come with canvas and stage dimensions baked in

idealy, we could think of car coordinates without considering these other coordinates until render happens

*/


function Car(ctx, center, car){
	if(!car.alive){
		return;
	}
	ctx.save();
	ctx.translate(
			car.x+400,
			car.y + 375,
	);

	if(car.rotate){
		ctx.rotate((-car.direction + car.rotate) * Math.PI/180);
	} else {
		ctx.rotate((car.direction) * Math.PI/180);
	}

	ctx.beginPath();
	ctx.rect(
			car.radius*3/-2,
			car.radius*1.8/-2,
			car.radius*3, car.radius*1.8
	);
	ctx.fillStyle = car.changing && car.changing.length
			? 'red'
			: car.color;
	ctx.strokeStyle = "#888";
	ctx.fill();
	//ctx.stroke();
	ctx.closePath();


	// headlights
	ctx.beginPath();
	ctx.globalAlpha = 0.3;
	ctx.fillStyle = "#FFFFE0";
	ctx.arc(8, 0, 5, 0, TWO_PI);
	ctx.fill();
	ctx.closePath();

	// headlights
	ctx.beginPath();
	ctx.globalAlpha = 0.4;
	ctx.fillStyle = "red";
	ctx.arc(-4, 0, 2, 0, TWO_PI);
	ctx.fill();
	ctx.closePath();

	ctx.restore();
}

export default Car;
