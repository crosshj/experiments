
const Persist = require('./persistance');
const express = require('express');
const app = express();
const port = 3080;

async function initAPI(db){

	function handler(name){
		return async (req, res) => {
			let result;
			if(db[name]){
				result = await db.name();
			} else {
				console.log(name);
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

	app.get('/service/create', handler('create'));
	app.get('/service/read', handler('read'));
	app.get('/service/update', handler('update'));
	app.get('/service/delete', handler('delete'));

	app.get('/manage', handler('manage'));
	app.get('/monitor', handler('monitor'));
	app.get('/persist', handler('persist'));

	await app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}


(async () => {
	try {
		const dbConfig = {};
		const db = await Persist.init(dbConfig);
		await initAPI({ db });
	} catch(e) {
		console.log(e);
	}
})();
