const PNG = require('node-png').PNG;
const express = require('express');
const reload = require('reload');
const path = require('path');
const expressLess = require('express-less');

const port = 3133;

//http://progur.com/2017/02/create-mandelbrot-fractal-javascript.html
var magnificationFactor = 600;
var panX = 2.5;
var panY = 1.4;
function checkIfBelongsToMandelbrotSet(x, y) {
	var realComponentOfResult = x;
	var imaginaryComponentOfResult = y;
	var maxIterations = 75;
	for (var i = 0; i < maxIterations; i++) {
		var tempRealComponent = realComponentOfResult * realComponentOfResult - imaginaryComponentOfResult * imaginaryComponentOfResult + x;
		var tempImaginaryComponent = 2 * realComponentOfResult * imaginaryComponentOfResult + y;
		realComponentOfResult = tempRealComponent;
		imaginaryComponentOfResult = tempImaginaryComponent;

		// Return a number as a percentage
		if (realComponentOfResult * imaginaryComponentOfResult > 5)
			return (i / maxIterations);
	}
	return 0;   // Return zero if in set        
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 * 
 * https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
 */
function hslToRgb(h, s, l) {
	var r, g, b;

	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		var hue2rgb = function hue2rgb(p, q, t) {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


const app = express();
app.set('port', process.env.PORT || port);

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '.', 'index.htm'));
});

app.use('/css', expressLess(__dirname + '/css', { cache: true }));

//TODO: move this away!
app.get('/png', function (req, res) {
	res.set('Content-Type', 'image/png');
	const png = new PNG({ width: 2048, height: 1536 });

	for (var y = 0; y < png.height; y++) {
		for (var x = 0; x < png.width; x++) {
			var idx = (png.width * y + x) << 2;
			// TODO: pass these params to png
			var ex = x / magnificationFactor - panX;
			var ay = y / magnificationFactor - panY;
			var inSet = checkIfBelongsToMandelbrotSet(ex, ay);
			if (!inSet) {
				png.data[idx] = 0;
				png.data[idx + 1] = 0;
				png.data[idx + 2] = 0;
				png.data[idx + 3] = 255;
			} else {
				var rgb = hslToRgb(0, 1, inSet);
				png.data[idx] = rgb[0];
				png.data[idx + 1] = rgb[1];
				png.data[idx + 2] = rgb[2];
				png.data[idx + 3] = 255;//rgb[0];
			}
		}
	}
	png.pack().pipe(res);
});

reload(app, {verbose: true});

app.listen(port, () => {
	console.log(`--- image-maker server running on http://localhost:${app.get('port')}`);
});
