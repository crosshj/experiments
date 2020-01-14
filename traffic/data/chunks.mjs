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

function linkChunks(stage){
	const stats = stage.chunks.reduce((stats, one) => {
		if(stats.height){
			return stats;
		}
		if(one.x < stats.widthCounter){
			stats.height = stage.chunks.length / stats.width;
			delete stats.widthCounter;
		} else {
			stats.width++;
			stats.widthCounter = one.x;
		}
		return stats;
	}, {
		width: 0, height: 0,
		widthCounter: 0
	});

	stage.chunks.forEach((c, i) => {
		const row = Math.floor(i/stats.width);
		const column = i % stats.width;

		c.north = row === 0
			? undefined
			: stage.chunks[i-stats.width];
		c.south = row === (stats.height-1)
			? undefined
			: stage.chunks[i+stats.width];;

		c.east = column === (stats.width -1)
			? undefined
			: stage.chunks[i+1];
		c.west = column === 0
			? undefined
			: stage.chunks[i-1];
	});

	//console.log({ chunks: stage.chunks });
}

function chunks(_stage){
	_stage.chunks[0].type = 'straight';

	_stage.chunks[1].type = 'straight';
	//_stage.chunks[1].rotate = 90;

	_stage.chunks[2].type = 'curved';

	// _stage.chunks[3].type = 'curved';
	// _stage.chunks[3].rotate = 90;

	_stage.chunks[4].type = "straight";
	_stage.chunks[4].rotate = 90;


	// _stage.chunks[4].type = 'intersect';
	// _stage.chunks[4].degree = 4;

	// _stage.chunks[5].type = 'intersect';
	// _stage.chunks[5].degree = 3;

	// _stage.chunks[6].type = 'intersect';
	// _stage.chunks[6].degree = 3;
	// _stage.chunks[6].rotate = 90;

	_stage.chunks[18].type = 'straight';
	_stage.chunks[18].rotate = 90;

	_stage.chunks[20].type = 'straight';
	_stage.chunks[20].rotate = 90;

	_stage.chunks[34].type = 'curved';
	_stage.chunks[34].rotate = 180;

	_stage.chunks[35].type = 'intersect';
	_stage.chunks[35].degree = 3;
	_stage.chunks[35].rotate = 90;

	_stage.chunks[36].type = 'curved';
	_stage.chunks[36].rotate = 90;

	_stage.chunks[50].type = 'curved';
	_stage.chunks[50].rotate = 270;

	_stage.chunks[51].type = 'curved';
	_stage.chunks[51].rotate = 90;

	_stage.chunks[66].type = 'straight';
	_stage.chunks[66].rotate = 90;

	_stage.chunks[82].type = 'intersect';
	_stage.chunks[82].degree = 4;


	(new Array(11)).fill().forEach((x, i) => {
			_stage.chunks[80+i].type = 'straight';
	});
	_stage.chunks[82].type = 'intersect';
	_stage.chunks[82].degree = 4;

	_stage.chunks[88].type = 'intersect';
	_stage.chunks[88].degree = 3;
	_stage.chunks[88].rotate = 270;
	(new Array(5)).fill().forEach((x, i) => {
			_stage.chunks[8+i*16].type = 'straight';
			_stage.chunks[8+i*16].rotate = 90;
	});

	(new Array(10)).fill().forEach((x, i) => {
			_stage.chunks[98+i*16].type = 'straight';
			_stage.chunks[98+i*16].rotate = 90;
	});
	_stage.chunks[91].type = 'straight';
	_stage.chunks[92].type = 'straight';
	_stage.chunks[93].type = 'curved';

	 // 3rd column
	(new Array(10)).fill().forEach((x, i) => {
			_stage.chunks[109+i*16].type = 'straight';
			_stage.chunks[109+i*16].rotate = 90;

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
			_stage.chunks[n.index].type = "curved";
			_stage.chunks[n.index].rotate = n.rotate;
		});
	_stage.chunks[205].rotate = 0;

	_stage.chunks[114].type = 'intersect';
	_stage.chunks[114].degree = 3;
	_stage.chunks[114].rotate = 0;
	ArrayFromTo(115, 124)
		.forEach(n => {
			_stage.chunks[n].type = "straight";
		});
	_stage.chunks[125].type = 'intersect';
	_stage.chunks[125].degree = 3;
	_stage.chunks[125].rotate = 180;

	_stage.chunks[121].type = 'intersect';
	_stage.chunks[121].degree = 3;
	_stage.chunks[121].rotate = 90;

	ArrayFromTo(137, 249, 16)
		.forEach(n => {
			_stage.chunks[n].type = "straight";
			_stage.chunks[n].rotate = 90;
		});

	_stage.chunks[40].type = 'intersect';
	_stage.chunks[40].degree = 4;
	[38, 41, 42, 43, 44, 45, 46, 47, 39, 54, 70, 86]
		.forEach(n => {
			_stage.chunks[n].type = "straight";
			if([54, 70].includes(n)){
				_stage.chunks[n].rotate = 90;
			}
			if([38].includes(n)){
				_stage.chunks[n].type = "curved";
				_stage.chunks[n].rotate = 270;
			}
			if([86].includes(n)){
				_stage.chunks[n].type = "intersect";
				_stage.chunks[n].degree = 3;
				_stage.chunks[n].rotate = 270;
			}
		});

	[117, 133, 149, 148, 164, 180, 181, 182, 166, 150]
		.forEach((n, i) => {
			n = n+1;
			const straight = [133, 164, 181, 166].map(x => x+1);
			const curved = [148, 150, 180, 182].map(x => x+1);
			const intersect = [117, 149].map(x => x+1);
			const rot90 = [117, 182].map(x => x+1);
			const rot180 = [180].map(x => x+1);
			const rot270 = [133, 164, 166, 149, 148].map(x => x+1);

			if(straight.includes(n)){
				_stage.chunks[n].type = "straight";
			}
			if(curved.includes(n)){
				_stage.chunks[n].type = "curved";
			}
			if(intersect.includes(n)){
				_stage.chunks[n].type = "intersect";
				_stage.chunks[n].degree = 3;
			}
			if(rot90.includes(n)){
				_stage.chunks[n].rotate = 90;
			}
			if(rot180.includes(n)){
				_stage.chunks[n].rotate = 180;
			}
			if(rot270.includes(n)){
				_stage.chunks[n].rotate = 270;
			}
		});

	linkChunks(_stage);

	_stage.chunks = _stage.chunks.map(c => new Chunk(c));

	return _stage;
}

export default chunks;
