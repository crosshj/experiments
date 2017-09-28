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
    const blockWidth = 10;
    const blockHeight = 10;
    const data = native.test(image, WIDTH, HEIGHT, blockWidth, blockHeight);
    png.data = data;
    png.pack().pipe(fs.createWriteStream(__dirname + '/../images/out.png'));
    var testPassed = true;
    for (var i=0; i<WIDTH*HEIGHT*4; i++){
        if (image[i] !== data[i]){
            testPassed = false;
            break;
        }
    }
    console.log(`Test ${testPassed ? 'PASSED' : 'FAILED'}`);
}

function readErrCallback(err) {
    console.log('Failed Test', err);
}

fs.createReadStream(__dirname + '/../images/test.png')
    .pipe(new PNG({
        width: WIDTH,
        height: HEIGHT
    }))
    .on('parsed', readCallback)
    .on('error', readErrCallback);
