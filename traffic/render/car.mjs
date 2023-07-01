/*

currently, car's coordinates come with canvas and stage dimensions baked in

idealy, we could think of car coordinates without considering these other coordinates until render happens

*/

function draw({ car, ctx }){
	const CENTER_OFFSET_X = -2.5;
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

	// car body
	ctx.beginPath();
	ctx.rect(
			CENTER_OFFSET_X+car.radius*3/-2,
			car.radius*1.8/-2,
			car.radius*3,
			car.radius*1.8
	);
	ctx.fillStyle = car.changing && car.changing.length
			? 'red'
			: car.color;
	ctx.fill();
	ctx.closePath();


	// headlights
	
	// ctx.shadowColor = "black";
	// ctx.shadowBlur = 6;
	// ctx.shadowOffsetX = 6;
	// ctx.shadowOffsetY = 6;
	// ctx.shadowColor = "orange";
	// ctx.strokeRect(25, 25, 200, 200);
	// ctx.shadowColor = "green";
	// ctx.strokeRect(50, 50, 200, 200);
	// ctx.shadowBlur = 20;
	// ctx.shadowColor = "red";

	ctx.globalAlpha = 0.15;
	ctx.fillStyle = "#FFFF88";
	ctx.beginPath();
	ctx.moveTo(CENTER_OFFSET_X+8+6, -5); //wide part driver
	ctx.lineTo(CENTER_OFFSET_X+8+6, 5);  //wide part passenger
	ctx.lineTo(CENTER_OFFSET_X+8-2, 3);  //narrow driver
	ctx.lineTo(CENTER_OFFSET_X+8-2, -3); //narrow driver
	ctx.fill();
	ctx.closePath();

	ctx.globalAlpha = 0.15;
	ctx.fillStyle = "#FFFFFF";
	ctx.beginPath();
	ctx.moveTo(CENTER_OFFSET_X+8+3, -3.5); //wide part driver
	ctx.lineTo(CENTER_OFFSET_X+8+3, 3.5);  //wide part passenger
	ctx.lineTo(CENTER_OFFSET_X+8-2, 3);  //narrow driver
	ctx.lineTo(CENTER_OFFSET_X+8-2, -3); //narrow driver
	ctx.fill();
	ctx.closePath();


	// taillights
	const TAIL_OFFSET_Y = 1.5
	const TAIL_RADIUS = 1.5;
	ctx.globalAlpha = 0.4;
	ctx.fillStyle = "red";

	// taillight driver
	ctx.beginPath();
	ctx.arc(CENTER_OFFSET_X+-5, -TAIL_OFFSET_Y, TAIL_RADIUS, 0, TWO_PI);
	ctx.fill();
	ctx.closePath();
	
	// taillight passenger
	ctx.beginPath();
	ctx.arc(CENTER_OFFSET_X+-5, TAIL_OFFSET_Y, TAIL_RADIUS, 0, TWO_PI);
	ctx.fill();
	ctx.closePath();

	// windows
	const FRONT_WINDOW_OFFSET_X = -0.5;
	const BACK_WINDOW_OFFSET_X = -5.5;
	ctx.globalAlpha = 0.45;
	ctx.fillStyle = "black";

	// front window
	ctx.fillRect(FRONT_WINDOW_OFFSET_X, -car.radius,1,car.radius*2);

	// back window
	ctx.fillRect(BACK_WINDOW_OFFSET_X, -car.radius,1,car.radius*2);


	ctx.restore();
}

function Car(ctx, car){
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

	draw({ car, ctx });
}

export default Car;
