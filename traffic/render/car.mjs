/*

currently, car's coordinates come with canvas and stage dimensions baked in

idealy, we could think of car coordinates without considering these other coordinates until render happens

*/


function Car(ctx, center, car){
	//console.log({ car });
	//debugger;
	if(!car.alive){
		return;
	}
	if(window.DEBUG_CHUNK && car.chunk){
		ctx.save();
			ctx.beginPath();
			ctx.rect(
				car.chunk.min._x,
				car.chunk.min._y,
				car.chunk.max._x - car.chunk.min._x,
				car.chunk.max._y - car.chunk.min._y,
			);
			ctx.fillStyle = "rgba(50, 205, 50, 0.2)";
			ctx.fill();
			ctx.closePath();
		ctx.restore();
	}
	if(window.DEBUG_CHUNK && car.prevChunk){
		ctx.save();
			ctx.beginPath();
			ctx.rect(
				car.prevChunk.min._x,
				car.prevChunk.min._y,
				car.prevChunk.max._x - car.prevChunk.min._x,
				car.prevChunk.max._y - car.prevChunk.min._y,
			);
			ctx.fillStyle = "rgba(255, 140, 0, 0.15)";
			ctx.fill();
			ctx.closePath();
		ctx.restore();
	}

	ctx.save();
	ctx.translate(
			car.x, // - ctx.canvas.width / 2,
			car.y, // - ctx.canvas.height / 2,
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
	ctx.fill();
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
