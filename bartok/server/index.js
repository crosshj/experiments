
const Persist = require('./persistance');
const express = require('express');
const app = express();
const port = 3080;
const managerInit = require('./manager').init;

async function initAPI({ manager }){

	function handler(name){
		return async (req, res) => {
			let result;
			try {
				result = await manager[name](req.params);
			}catch(e){
				//console.log(e)
				process.stdout.write(name + ' - ');
			}
			res.json({ message: name, result });
		}
	}

	var allowCrossDomain = function(req, res, next) {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
			res.header('Access-Control-Allow-Headers', 'Content-Type');

			next();
	};
	app.use(allowCrossDomain);

	app.get('/', handler('hello'));

	app.post('/service/create', handler('create'));
	app.get('/service/read/:id*?', handler('read'));
	app.post('/service/update', handler('update'));
	app.post('/service/delete', handler('delete'));

	app.get('/manage', handler('manage'));
	app.get('/monitor', handler('monitor'));
	app.get('/persist', handler('persist'));

	await app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}


(async () => {
	try {
		const dbConfig = {};
		const db = await Persist.init(dbConfig);
		const manager = await managerInit({ db });
		console.log({ keys: Object.keys(manager)})
		await initAPI({ db, manager });
	} catch(e) {
		console.log(e);
	}
})();
