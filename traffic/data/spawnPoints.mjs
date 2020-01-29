import SpawnPoint from '../models/SpawnPoint.mjs';

function spawnPoints(
	CLIENT_WIDTH, CLIENT_HEIGHT
) {
	return [
			//1st column
			{
					x: -265.5,
					y: 425,
					life: 1200, //400
					direction: 270
			},
			//2nd column
			{
					x: 80.5,
					y: 425,
					life: 925, //400,
					direction: 270
			},
			// 3rd column
			{
					x: 280,
					y: 425,
					life: 1200,
					direction: 270
			},
			// TOP column
			{
					x: 19,
					y: -375,
					life: 1200,//100,
					direction: 90
			},
			// LEFT - row
			{
					x: -400,
					y: -95,
					life: 2600, //300
					direction: 0
			},
			// RIGHT - row
			{
					x: 400,
					y: -255,
					life: 1200,//350,
					direction: 180
			}
	].map(x => {
		x.x += CLIENT_WIDTH / 2;
		x.y += CLIENT_HEIGHT / 2;
		return new SpawnPoint(x);
	});
}

export default spawnPoints;