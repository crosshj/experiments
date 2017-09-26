const fs = require('fs');
const PNG = require('node-png').PNG;
const native = require('../native');

const png = new PNG({
    width: 100,
    height: 100
});

function readCallback(image) {
    const data = native.test(image, 100, 100);
    console.log('TODO: some testing here');
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
