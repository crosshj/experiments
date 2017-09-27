const fs = require('fs');
const PNG = require('node-png').PNG;
const native = require('../native/debug.js');

const png = new PNG({
    width: 100,
    height: 100
});

function readCallback(image) {
    const data = native.test(image, 100, 100);
    png.pack().pipe(fs.createWriteStream(__dirname + '/../images/out.png'));
    (new Array(10)).fill().forEach((_, i) =>{
        console.log({
            in: image[i],
            out: data[i]
        });
    });
}

function readErrCallback(err) {
    console.log(err);
}

fs.createReadStream(__dirname + '/../images/test.png')
    .pipe(new PNG({
        width: 100,
        height: 100
    }))
    .on('parsed', readCallback)
    .on('error', readErrCallback);
