/*
see https://github.com/wadey/node-microtime for an example of native node module
setup with minimal extra code

native module buffers
https://community.risingstack.com/using-buffers-node-js-c-plus-plus/

cache buffer?
https://www.bennadel.com/blog/2681-turning-buffers-into-readable-streams-in-node-js.htm

*/

const routes = require('express').Router();
const fs = require('fs');
const PNG = require('node-png').PNG;
const native = require('../native');

routes.get('/', function (req, res) {
	res.set('Content-Type', 'image/png');
	const png = new PNG({
		width: req.query.width || 1024,
		height: req.query.height || 768
	});

	let meta = {};

	function readMetaCallback(metaData) {
		meta = JSON.parse(JSON.stringify(metaData));
	}

	function readCallback(read) {
		const xOffset = Math.floor((meta.width - png.width) * .5);
		const yOffset = Math.floor((meta.height - png.height) * .5);

		// NOTE: won't work if native module not built
		const chopped = native.chop(read);
		//const chopped = read;

		// TODO: do this cropping in module
		for (var y = 0; y < png.height; y++) {
			for (var x = 0; x < png.width; x++) {
				var metaidx = (meta.width * (y + yOffset) + x + xOffset) << 2;
				var idx = (png.width * y + x) << 2;

				png.data[idx] = chopped[metaidx];
				png.data[idx + 1] = chopped[metaidx + 1];
				png.data[idx + 2] = chopped[metaidx + 2];
				png.data[idx + 3] = chopped[metaidx + 3];
			}
		}

		png.pack().pipe(res);
	}

	function readErrCallback(err) {
		console.log(err);
		for (var y = 0; y < png.height; y++) {
			for (var x = 0; x < png.width; x++) {
				var idx = (png.width * y + x) << 2;
				png.data[idx] = Math.floor(Math.random() * 255);
				png.data[idx + 1] = Math.floor(Math.random() * 255);
				png.data[idx + 2] = Math.floor(Math.random() * 255);
				png.data[idx + 3] = 255;
			}
		}
		png.pack().pipe(res);
	}

	fs.createReadStream(__dirname + '/../images/jellyfish2.png')
		.pipe(new PNG({
			//filterType: 4
		}))
		.on('metadata', readMetaCallback)
		.on('parsed', readCallback)
		.on('error', readErrCallback);
});

module.exports = routes;
