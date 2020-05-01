import Chunk from '../models/Chunk.mjs';
/* this is a logical chunk of the map */

function ArrayFromTo(first, last, step=1){
	const array = [];

	let number = first;

	while(number <= last){
		array.push(number);
		number += step;
	}
	return array;
}

function linkChunks(chunks){
	const stats = chunks.reduce((stats, one) => {
		if(stats.height){
			return stats;
		}
		if(one._x < stats.widthCounter){
			stats.height = chunks.length / stats.width;
			delete stats.widthCounter;
		} else {
			stats.width++;
			stats.widthCounter = one._x;
		}
		return stats;
	}, {
		width: 0, height: 0,
		widthCounter: 0
	});

	chunks.forEach((c, i) => {
		const row = Math.floor(i/stats.width);
		const column = i % stats.width;

		c.north = row === 0
			? undefined
			: chunks[i-stats.width];
		c.south = row === (stats.height-1)
			? undefined
			: chunks[i+stats.width];;

		c.east = column === (stats.width -1)
			? undefined
			: chunks[i+1];
		c.west = column === 0
			? undefined
			: chunks[i-1];
	});

	//console.log({ chunks: stage.chunks });
}

function demoChunks(chunks){
	chunks[0].type = 'straight';

	chunks[1].type = 'straight';
	//chunks[1].rotate = 90;

	chunks[2].type = 'curved';

	// chunks[3].type = 'curved';
	// chunks[3].rotate = 90;

	chunks[4].type = "straight";
	chunks[4].rotate = 90;


	// chunks[4].type = 'intersect';
	// chunks[4].degree = 4;

	// chunks[5].type = 'intersect';
	// chunks[5].degree = 3;

	// chunks[6].type = 'intersect';
	// chunks[6].degree = 3;
	// chunks[6].rotate = 90;

	chunks[18].type = 'straight';
	chunks[18].rotate = 90;

	chunks[20].type = 'straight';
	chunks[20].rotate = 90;

	chunks[34].type = 'curved';
	chunks[34].rotate = 180;

	chunks[35].type = 'intersect';
	chunks[35].degree = 3;
	chunks[35].rotate = 90;

	chunks[36].type = 'curved';
	chunks[36].rotate = 90;

	chunks[50].type = 'curved';
	chunks[50].rotate = 270;

	chunks[51].type = 'curved';
	chunks[51].rotate = 90;

	chunks[66].type = 'straight';
	chunks[66].rotate = 90;

	chunks[82].type = 'intersect';
	chunks[82].degree = 4;


	(new Array(11)).fill().forEach((x, i) => {
			chunks[80+i].type = 'straight';
	});
	chunks[82].type = 'intersect';
	chunks[82].degree = 4;

	chunks[88].type = 'intersect';
	chunks[88].degree = 3;
	chunks[88].rotate = 270;
	(new Array(5)).fill().forEach((x, i) => {
			chunks[8+i*16].type = 'straight';
			chunks[8+i*16].rotate = 90;
	});

	(new Array(10)).fill().forEach((x, i) => {
			chunks[98+i*16].type = 'straight';
			chunks[98+i*16].rotate = 90;
	});
	chunks[91].type = 'straight';
	chunks[92].type = 'straight';
	chunks[93].type = 'curved';

	 // 3rd column
	(new Array(10)).fill().forEach((x, i) => {
			chunks[109+i*16].type = 'straight';
			chunks[109+i*16].rotate = 90;

	});
	[{
		index: 253, rotate: 0
	},{
		index: 252, rotate: 180
	},{
		index: 236, rotate: 270
	},{
		index: 237, rotate: 90
	},{
		index: 221, rotate: 0
	},{
		index: 220, rotate: 180
	},{
		index: 204, rotate: 270
	},{
		index: 206, rotate: 90
	},{
		index: 190, rotate: 0
	},{
		index: 189, rotate: 180
	},{
		index: 157, rotate: 270
	},{
		index: 158, rotate: 90
	},{
		index: 142, rotate: 0
	},{
		index: 141, rotate: 180
	}]
		.forEach(n => {
			chunks[n.index].type = "curved";
			chunks[n.index].rotate = n.rotate;
		});
	chunks[205].rotate = 0;

	chunks[114].type = 'intersect';
	chunks[114].degree = 3;
	chunks[114].rotate = 0;
	ArrayFromTo(115, 124)
		.forEach(n => {
			chunks[n].type = "straight";
		});
	chunks[125].type = 'intersect';
	chunks[125].degree = 3;
	chunks[125].rotate = 180;

	chunks[121].type = 'intersect';
	chunks[121].degree = 3;
	chunks[121].rotate = 90;

	ArrayFromTo(137, 249, 16)
		.forEach(n => {
			chunks[n].type = "straight";
			chunks[n].rotate = 90;
		});

	chunks[40].type = 'intersect';
	chunks[40].degree = 4;
	[38, 41, 42, 43, 44, 45, 46, 47, 39, 54, 70, 86]
		.forEach(n => {
			chunks[n].type = "straight";
			if([54, 70].includes(n)){
				chunks[n].rotate = 90;
			}
			if([38].includes(n)){
				chunks[n].type = "curved";
				chunks[n].rotate = 270;
			}
			if([86].includes(n)){
				chunks[n].type = "intersect";
				chunks[n].degree = 3;
				chunks[n].rotate = 270;
			}
		});

	[117, 133, 149, 148, 164, 180, 181, 182, 166, 150]
		.forEach((n, i) => {
			n = n+1;
			const straight = [133, 164, 181, 166].map(x => x+1);
			const curved = [148, 150, 180, 182].map(x => x+1);
			const intersect = [117, 149].map(x => x+1);
			const rot90 = [133, 117, 182].map(x => x+1);
			const rot180 = [180].map(x => x+1);
			const rot270 = [164, 166, 149, 148].map(x => x+1);

			if(straight.includes(n)){
				chunks[n].type = "straight";
			}
			if(curved.includes(n)){
				chunks[n].type = "curved";
			}
			if(intersect.includes(n)){
				chunks[n].type = "intersect";
				chunks[n].degree = 3;
			}
			if(rot90.includes(n)){
				chunks[n].rotate = 90;
			}
			if(rot180.includes(n)){
				chunks[n].rotate = 180;
			}
			if(rot270.includes(n)){
				chunks[n].rotate = 270;
			}
		});

	linkChunks(chunks);

	chunks = chunks.map(c => new Chunk(c));

	return chunks;
}

function initChunks(ctx, width, height, chunkSize){
	/*
		this is a major problem:

		chunks should have dimensions that are related to stage and not hosting canvas

		only on render should the location of the chunk then be translated to canvas coords

		this makes it difficult to reason about how vehicles are related to the road
			without having to account for canvas coordinates

		this also means that chunks must be recomputed when stage changes position on canvas
	*/

	const chunks = [];
	var index = 0;
	for (var y=0; y < height; y += chunkSize){
			for (var x=0; x < width; x += chunkSize){
					chunks.push({
							index,
							_x: x,
							_y: y
					});
					index += 1;
			}
	}
	const _chunks = demoChunks(chunks);
	_chunks.forEach(ch => {
		ch.min = {
				_x: ch._x,
				_y: ch._y,
		};
		ch.max = {
				_x: ch._x + chunkSize,
				_y: ch._y + chunkSize,
		};
		ch.size = chunkSize;
	});
	return _chunks;
}

export default initChunks;
