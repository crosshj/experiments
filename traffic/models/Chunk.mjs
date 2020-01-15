function rotate(centerX, centerY, x, y, angle) {
	var radians = (Math.PI / 180) * angle,
			cos = Math.cos(radians),
			sin = Math.sin(radians),
			nx = (cos * (x - centerX)) + (sin * (y - centerY)) + centerX,
			ny = (cos * (y - centerY)) - (sin * (x - centerX)) + centerY;
	return [nx, ny];
}
const distance = (self, target) => {
	const {x:x1, y:y1} = self;
	const {x:x2, y:y2} = target;
	const distance =  Math.hypot(x2-x1, y2-y1);
	//distance < 30 && console.log(`x diff: ${h}, y diff: ${v}, distance: ${distance}`);
	return distance;
};

function curvedMove(chunk, car, umvelt, intersect){
		// find center of rotation based on chunk
		// determine change in x, y, direction, and rotation based on speed and chunk rotation center

		const angleSign = [180, 270].includes(chunk.rotate)
			? -1
			: 1;

		let reverseCurve = car.reverseCurve;
		if(!car.turning && car.direction === 0 && (!chunk.rotate || chunk.rotate === 0)){
			reverseCurve = true;
		}

		if(!car.turning && car.direction === 90 && chunk.rotate === 180){
			reverseCurve = true;
		}

		if(!car.turning && car.direction === 180 && chunk.rotate === 270){
			reverseCurve = true;
		}

		const rotCenter = chunkRotCenter(chunk, intersect);
		const distanceFromCenter = distance({
			x: rotCenter.x-umvelt.center.x,
			y: rotCenter.y-umvelt.center.y,
		},
			car
		);
		//const distanceFromCenter = distance(rotCenter, car);

		let angle = angleSign * 11 * (car.speed / 2) * (1 - distanceFromCenter/50);
		if(reverseCurve){
			angle = -1 * angle;
		}
		const newCoords = rotate(
			rotCenter.x-umvelt.center.x,
			rotCenter.y-umvelt.center.y,
			car.x, car.y,
			angle
		);

		/*
		//TODO: turning rotation: this could be done better, but fine for now
		// also - this is buggier than what is below
		const distanceFromCenter = distance({
			x: rotCenter.x-umvelt.center.x,
			y: rotCenter.y-umvelt.center.y,
		},
			{ x: newCoords[0], y: newCoords[1] }
		);
		const relativeXDistance = newCoords[0] - rotCenter.x + umvelt.center.x;
		const relativeYDistance = rotCenter.y + umvelt.center.y - newCoords[1];
		const xFactor = (1 - (relativeXDistance / distanceFromCenter));
		const yFactor = relativeYDistance / distanceFromCenter;
		const averageFactor = (xFactor + yFactor) / 2;
		*/

		const relativeXDistance = Math.abs(newCoords[0] - rotCenter.x + umvelt.center.x);

		//TODO: see above, this is hacky and wrong
		const rot = (() => {
			const portion = (1 - (relativeXDistance / distanceFromCenter));
			return {
				0: -90 * portion,
				90: 90 * portion,
				180: -90 * portion,
				270: 90 * portion,
			}[chunk.rotate||0];
		})();
		return {
			x: newCoords[0],
			y: newCoords[1],
			rotate: rot,
			reverseCurve
		};
}

function chunkRotCenter(chunk, intersect){
	//TODO: change based on chunk attributes
	let whichRot = chunk.rotate || 0;
	if(chunk.type === "intersect"){
		whichRot = intersect;
	}
	const rots = {
		0: {
			x: chunk.min.x,
			y: chunk.max.y
		},
		90: {
			x: chunk.min.x,
			y: chunk.min.y
		},
		180: {
			x: chunk.max.x,
			y: chunk.min.y
		},
		270: {
			x: chunk.max.x,
			y: chunk.max.y
		}
	}
	return rots[whichRot];
};

function Chunk(chunkdef) {
	this.init(chunkdef);
}

//------------------------------------------------------------------------------

Chunk.prototype = {
	init: function (chunkdef) {
		Object.keys(chunkdef).forEach(key => {
			this[key] = chunkdef[key];
		});
	},
	move: function (car, umvelt, intersect) {
		let xdiff = 'TODO';
		let ydiff = 'TODO';
		let rotate = random(0, 359);

		let curvedTransform;
		if(this.type === "curved" || this.type === "intersect"){
			//TODO: should not be using umvelt here
			curvedTransform = curvedMove(this, car, umvelt, intersect);
		}

		const transform = {
			x: xdiff,
			y: ydiff,
			rotate
		};
		return curvedTransform || transform;
	}
};

export default Chunk;
