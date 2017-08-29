/*
see https://github.com/wadey/node-microtime for an example of native node module
setup with minimal extra code

*/

const routes = require('express').Router();
const fs = require('fs');
const PNG = require('node-png').PNG;

routes.get('/', function (req, res) {
	res.set('Content-Type', 'image/png');
	const png = new PNG({
		width: req.query.width || 1024,
		height: req.query.height || 768
	});

	let meta = {};

	function readMetaCallback(metaData){
		meta = JSON.parse(JSON.stringify(metaData));
	}

	function readCallback(read){
		const chopped = choppedImage(read, meta);
		const xOffset = Math.floor((meta.width - png.width) * .9);
		const yOffset = Math.floor((meta.height - png.height) * .9);
		console.log({yOffset, xOffset});
		for (var y = 0; y < png.height; y++) {
			for (var x = 0; x < png.width; x++) {
				var metaidx = (meta.width * (y + yOffset) + x + xOffset) << 2;
				var idx = (png.width * y + x) << 2;
				
				const choppedColor = {
					red: chopped[metaidx],
					green: chopped[metaidx + 1],
					blue: chopped[metaidx + 2]
				};

				png.data[idx] = choppedColor.red;
				png.data[idx + 1] = choppedColor.green;
				png.data[idx + 2] = choppedColor.blue;
				png.data[idx + 3] = 255;
			}
		}
		png.pack().pipe(res);		
	}

	function readErrCallback(err){
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
	
	fs.createReadStream(__dirname + '/../images/jellyfish.png')
		.pipe(new PNG({
			filterType: 4
		}))
		.on('metadata', readMetaCallback)
		.on('parsed', readCallback)
		.on('error', readErrCallback);
});

function choppedImage(data, meta){
	return data;
}

module.exports = routes;
