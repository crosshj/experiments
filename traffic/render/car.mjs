function Car(ctx, center, car){
	if(!car.alive){
		return;
	}
	ctx.save();
	ctx.translate(
			car.x + (center.x || 0),
			car.y + (center.y || 0),
	);
	if([0, 180].includes(car.direction)){
			ctx.rotate((car.rotate) * Math.PI/180);
	} else {
			ctx.rotate((90 + (car.rotate || 0)) * Math.PI/180);
	}

	ctx.beginPath();
	//ctx.arc(car.x + (center.x || 0), car.y + (center.y || 0), car.radius, 0, TWO_PI);
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
	ctx.restore();
}

export default Car;
