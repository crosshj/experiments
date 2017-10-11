const fs = require('fs');
const PNG = require('node-png').PNG;
const native = require('../native/debug.js');

const WIDTH = 300;
const HEIGHT = 300;

const png = new PNG({
    width: WIDTH,
    height: HEIGHT
});

function readCallback(image) {
    const blockWidth = 30;
    const blockHeight = 30;
    const numberOfRotates = 3;
    const tolerance = 70;
    const data = native.test(image, WIDTH, HEIGHT, blockWidth, blockHeight, numberOfRotates, tolerance);
    png.data = data;
    png.pack().pipe(fs.createWriteStream(__dirname + '/../images/out.png'));

    console.log(`Rotations written!!`);
}

function readErrCallback(err) {
    console.log('Read error', err);
}

fs.createReadStream(__dirname + '/../images/testColorBig.png')
    .pipe(new PNG({
        width: WIDTH,
        height: HEIGHT
    }))
    .on('parsed', readCallback)
    .on('error', readErrCallback);
