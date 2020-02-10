import SpawnPoint from '../models/SpawnPoint.mjs';

function spawnPoints() {
	return [
			//1st column
			{
					x: 131,
					y: 800,
					// x: 270,
					// y: 425,
					life: 1200, //400
					direction: 270
			},
			//2nd column
			{
					x: 481,
					y: 800,
					// x: 80.5,
					// y: 425,
					life: 925, //400,
					direction: 270
			},
			// 3rd column
			{
					x: 681,
					y: 800,
					// x: 280,
					// y: 425,
					life: 1200,
					direction: 270
			},
			// TOP-LEFT column
			{
					x: 219,
					y: 0,
					life: 1200,//100,
					direction: 90
			},
			// TOP column
			{
					x: 419,
					y: 0,
					life: 1200,//100,
					direction: 90
			},
			// LEFT - row
			{
					x: 0,
					y: 281,
					life: 2600, //300
					direction: 0
			},
			// LEFT-TOP - row
			{
					x: 0,
					y: 31,
					life: 2600, //300
					direction: 0
			},
			// RIGHT - row
			{
					x: 800,
					y: 119,
					// x: 400,
					// y: -255,
					life: 1200,//350,
					direction: 180
			}
	].map(x => {
		return new SpawnPoint(x);
	});
}

export default spawnPoints;