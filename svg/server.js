var sp = require('simple-livereload');

console.log({ sp })

var config = {
    port: 8887,
    fileType: [
        '*.jpg',
        '*.rb',
        '*.php'
    ]
};

sp.setPort(config.port);
sp.start();