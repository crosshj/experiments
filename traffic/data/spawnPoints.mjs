import SpawnPoint from '../models/SpawnPoint.mjs';

function spawnPoints(
	CLIENT_WIDTH, CLIENT_HEIGHT,
	STAGE_WIDTH, STAGE_HEIGHT
) {
	return [
			//1st column
			new SpawnPoint({
					x: CLIENT_WIDTH / 2 - STAGE_WIDTH / 2 + 130.5,
					y: CLIENT_HEIGHT / 2 + STAGE_HEIGHT / 2 + 25,
					life: 1200, //400
					margin: CLIENT_WIDTH / 2 - STAGE_WIDTH / 2 + 125.5,
					direction: 270
			}),
			//2nd column
			new SpawnPoint({
					x: CLIENT_WIDTH / 2 + 80.5,
					y: CLIENT_HEIGHT / 2 + STAGE_HEIGHT / 2 + 25,
					life: 1200, //400,
					margin: CLIENT_WIDTH / 2 + 75,
					direction: 270
			}),
			// 3rd column
			new SpawnPoint({
					x: CLIENT_WIDTH / 2 + STAGE_WIDTH / 2 - 120,
					y: CLIENT_HEIGHT / 2 + STAGE_HEIGHT / 2 + 25,
					life: 1200,
					margin: CLIENT_WIDTH / 2 + STAGE_WIDTH / 2 - 125,
					direction: 270
			}),
			// TOP column
			new SpawnPoint({
					x: CLIENT_WIDTH / 2 + 19,
					y: CLIENT_HEIGHT / 2 - STAGE_HEIGHT / 2 + 25,
					life: 1200,//100,
					margin: CLIENT_WIDTH / 2 + STAGE_WIDTH / 2 - 125,
					direction: 90
			}),
			// LEFT - row
			new SpawnPoint({
					x: CLIENT_WIDTH / 2 - STAGE_WIDTH / 2,
					y: CLIENT_HEIGHT / 2 - STAGE_HEIGHT / 2 + 25 + 280,
					life: 2600, //300
					direction: 0
			}),
			// RIGHT - row
			new SpawnPoint({
					x: CLIENT_WIDTH / 2 + STAGE_WIDTH / 2,
					y: CLIENT_HEIGHT / 2 - STAGE_HEIGHT / 2 + 25 + 120,
					life: 1200,//350,
					direction: 180
			})
	];
}

export default spawnPoints;