
/*
 |--------------------------------------------------------------------------
 | Browser-sync config file
 |--------------------------------------------------------------------------
 |
 | For up-to-date information about the options:
 |   http://www.browsersync.io/docs/options/
 */

 const packageJson = require('./package.json');

 module.exports = {
    "server": {
        baseDir: "..",
        directory: false
    },
    "middleware": [
        function (req, res, next) {
            if (req.url === '/'){
                res.writeHead(302, {Location: `/${packageJson.name}/`});
                res.end();
                return;
            }
            next();
        }
    ]
};
