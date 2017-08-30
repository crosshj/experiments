/*
see https://github.com/wadey/node-microtime for an example of native node module
setup with minimal extra code

https://community.risingstack.com/using-buffers-node-js-c-plus-plus/

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

	function readMetaCallback(metaData){
		meta = JSON.parse(JSON.stringify(metaData));
	}

	function readCallback(read){
		const xOffset = Math.floor((meta.width - png.width) * .5);
		const yOffset = Math.floor((meta.height - png.height) * .5);

		var imgArray = new Array(png.height * png.width * 4);
		for (var y = 0; y < png.height; y++) {
			for (var x = 0; x < png.width; x++) {
				var metaidx = (meta.width * (y + yOffset) + x + xOffset) << 2;
				var idx = (png.width * y + x) << 2;
				
				imgArray[idx] = read[metaidx];
				imgArray[idx + 1] = read[metaidx + 1];
				imgArray[idx + 2] = read[metaidx + 2];
				imgArray[idx + 3] = 255;
			}
		}

		imgArray = choppedImage(imgArray, {
			width: png.width,
			height: png.height
		});

		for (var i = 0; i < png.height * png.width * 4; i++){
			png.data[i] = imgArray[i];
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
	
	fs.createReadStream(__dirname + '/../images/jellyfish2.png')
		.pipe(new PNG({
			//filterType: 4
		}))
		.on('metadata', readMetaCallback)
		.on('parsed', readCallback)
		.on('error', readErrCallback);
});

// NOTE: won't work if native module not built: npm run build
function choppedImage(data, meta){
	return native.chop(data).data;
}

module.exports = routes;
