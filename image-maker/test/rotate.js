const fs = require('fs');
const PNG = require('node-png').PNG;
const native = require('../native/debug.js');

const WIDTH = 100;
const HEIGHT = 100;

const png = new PNG({
    width: WIDTH,
    height: HEIGHT
});

function readCallback(image) {
    const blockWidth = 5;
    const blockHeight = 5;
    const data = native.test(image, WIDTH, HEIGHT, blockWidth, blockHeight, 10000);
    png.data = data;
    png.pack().pipe(fs.createWriteStream(__dirname + '/../images/out.png'));

    console.log(`Rotations written!!`);
}

function readErrCallback(err) {
    console.log('Read error', err);
}

fs.createReadStream(__dirname + '/../images/test.png')
    .pipe(new PNG({
        width: WIDTH,
        height: HEIGHT
    }))
    .on('parsed', readCallback)
    .on('error', readErrCallback);
