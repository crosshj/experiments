const routes = require('express').Router();
const PNG = require('node-png').PNG;

routes.get('/', function (req, res) {
	res.set('Content-Type', 'image/png');
	const png = new PNG({
		width: req.query.width || 1024,
		height: req.query.height || 768
	});

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
});

module.exports = routes;
