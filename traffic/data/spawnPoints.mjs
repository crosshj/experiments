import SpawnPoint from '../models/SpawnPoint.mjs';

const life = 99999;
function spawnPoints() {
	return [
		//1st column
		{
			x: 131,
			y: 800,
			life,
			direction: 270
		},
		//2nd column
		{
			x: 481,
			y: 800,
			life,
			direction: 270
		},
		// 3rd column
		{
			x: 681,
			y: 800,
			life,
			direction: 270
		},
		// TOP-LEFT column
		{
			x: 219,
			y: 0,
			life,
			direction: 90
		},
		// TOP column
		{
			x: 419,
			y: 0,
			life,
			direction: 90
		},
		// LEFT - row
		{
			x: 0,
			y: 281,
			life,
			direction: 0
		},
		// LEFT-TOP - row
		{
			x: 0,
			y: 31,
			life,
			direction: 0
		},
		// RIGHT - row
		{
			x: 800,
			y: 119,
			life,
			direction: 180
		}
	].map(x => {
		return new SpawnPoint(x);
	});
}

export default spawnPoints;