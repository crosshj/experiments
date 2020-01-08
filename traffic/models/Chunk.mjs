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
function curvedMove(chunk, car, umvelt){
		// find center of rotation based on chunk
		// determine change in x, y, direction, and rotation based on speed and chunk rotation center

		const angle = 3.75 * (car.speed / 2);
		const rotCenter = chunkRotCenter(chunk);
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

		const distanceFromCenter = distance({
			x: rotCenter.x-umvelt.center.x,
			y: rotCenter.y-umvelt.center.y,
		},
			{ x: newCoords[0], y: newCoords[1] }
		);
		const relativeXDistance = newCoords[0] - rotCenter.x + umvelt.center.x;

		return {
			x: newCoords[0],
			y: newCoords[1],
			rotate: -90 * (1 - (relativeXDistance / distanceFromCenter)) //TODO: see above, this is hacky and wrong
		};
}

function chunkRotCenter(chunk){
	//TODO: change based on chunk attributes
	return {
			x: chunk.min.x,
			y: chunk.max.y
	}
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
	move: function (car, umvelt) {
		let xdiff = 'TODO';
		let ydiff = 'TODO';
		let rotate = random(0, 359);

		let curvedTransform;
		if(this.type === "curved"){
			//TODO: should not be using umvelt here
			curvedTransform = curvedMove(this, car, umvelt);
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
