
function whichChunkContainsObserver(chunks, observer, killObserver){
	// given observer's current location:

	// if observer is within current chunk, return chunk
	const prevChunk = observer.chunk;
	const isContained = !!prevChunk
			&& observer.x >= prevChunk.min._x
			&& observer.y >= prevChunk.min._y
			&& observer.x <= prevChunk.max._x
			&& observer.y <= prevChunk.max._y;
	if(isContained){
			return prevChunk;
	}

	//console.log('NOT contained');
	//debugger;


	// if observer outside chunk, find which chunk
	const newChunk = ((chunks, o, p) => {
			if(!!p){ // previous chunk
					const cardinal = map(o.direction);
					if(!cardinal || !p[cardinal]){
							//debugger;
					} else {
							return p[cardinal];
					}
			}
			const foundChunk = chunks.find(c => {
					const x = o.x;
					const y = o.y;
					return x >= c.min._x
							&& y >= c.min._y
							&& x <= c.max._x
							&& y <= c.max._y
			});
			if(!foundChunk
					|| !['curved', 'straight', 'intersect'].includes(foundChunk.type)
			){
					//debugger;
					killObserver();
			}
			//console.log(`I am in this chunk: ${foundChunk && foundChunk.index}`);

			return foundChunk;
	})(chunks, observer, prevChunk);

	// newChunk
	// 	? console.unique(`In chunk: ${newChunk.index}`)
	// 	: console.unique(`CHUNK NOT FOUND FOR CAR!`);
	return newChunk;

}

function sense(map, observer, view) {
	const { particles = [], chunks } = map;
	var result = {};

	if(view === 'proximity'){
			const neighbors = particles.filter(p => {
					if(observer.id === p.id) {
							return false;
					}
					const obsX = Math.abs(p.x - observer.x);
					const obsY = Math.abs(p.y - observer.y);

					const near = obsX < 30 || obsY < 30;
					return near;
			});
			result.neighbors = neighbors;
	}
	//console.log(map.stage.chunks[0]);

	const chunk = whichChunkContainsObserver(map.stage.chunks, {
			chunk: observer.chunk,
			x: observer.x,
			y: observer.y
	}, () => observer.alive = false );
	const lane = {};
	const ahead = {};
	const direction = 0;

	result.umvelt = {
			chunk,
			lane,
			ahead,
			direction
	};
	const observation = {
			action: view,
			result
	};
	return observation;
}

export default sense;