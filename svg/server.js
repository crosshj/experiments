const express = require('express');
const app = express();
const dot = require("dot");
const fs = require('fs');
const path = require('path');
const { join } = require('path');

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 9090 });

const buildEngine = require('./engine-src/build');

const port = 8888;

const replace = {
    config: '<script src="config.js"></script>',
    wires: '<script src="wires.js"></script>',
    state: '<script src="state.js"></script>',
    css: '<link rel="stylesheet" href="index.css">',
    engine: '<script src="engine.js"></script>'
};

const files = opts => ({
    config: '\n<script>\n' +
        fs.readFileSync(path.resolve(__dirname, 'config.js'), 'utf8') +
    '\n</script>\n',
    wires: '\n<script>\n' +
        fs.readFileSync(path.resolve(__dirname, 'wires.js'), 'utf8') +
    '\n</script>\n',
    state: '\n<script>\n' +
        fs.readFileSync(path.resolve(__dirname, 'state.js'), 'utf8') +
    '\n</script>\n',
    css: '\n<style>\n' +
        fs.readFileSync(path.resolve(__dirname, 'index.css'), 'utf8') +
    '\n</style>\n',
    engine: '\n<script>\n' +
        (opts.engine || '//engine') +
    '\n</script>\n'
});

var templateFromHTML = fs.readFileSync(
    path.resolve(__dirname, 'index.html'), 'utf8'
);

Object.keys(replace).forEach(key => {
    templateFromHTML = templateFromHTML.replace(replace[key], `{{=it.${key}}}`);
});

var engineSrc;
const render = (callback) => {
    if(engineSrc){
        const templateRender = dot.template(
            templateFromHTML
        )(files({ engine: engineSrc }));
        callback(null, templateRender);
        return;
    }
    const engineSrcPath = join(__dirname, "./engine-src/index.js");
    const engineBldPath = join(__dirname, "./engine.js");

    //TODO: if engine.js and engine-src are "same", use engine.js
    // ^^^ and this should be built into buildEngine (not here)

    // const stats = fs.statSync(filename);
    // if (stats.mtime.valueOf() === previousMTime.valueOf()) {
    //   return;
    // }

    buildEngine((err, data) => {
        if(err){
            callback(JSON.stringify(err));
        }
        engineSrc = `/*! Expression Engine */\n${data['expressionEngine.js']}`;
        const engine = engineSrc;

        fs.writeFile(engineBldPath, engine, function(err) {
            if(err) {
                return console.log(err);
            }
            const sourceStats = fs.statSync(engineBldPath);
            const buildStats = fs.statSync(engineSrcPath);
            console.log({
                sourceStats, buildStats
            });
            // set file time
            //fs.utimesSync(path, atime, mtime)

            console.log("engine.js built");
        });
        const templateRender = dot.template(
            templateFromHTML
        )(files({ engine }));
        callback(null, templateRender);
    });
};

app.use(function(req, res, next) {
    res.setHeader(
        "Content-Security-Policy",
        "script-src 'unsafe-inline' 'unsafe-eval' https://crosshj.com https://rawgit.com"
    );
    return next();
});

app.get('/', (req, res) => {
    render((err, rendered) => {
        res.send(err || rendered);
    });
});

app.get('/engine.js', (req, res) => {
    res.send('Okay');
});

app.get('/:name', (req, res, next) => {
    var options = {
        root: __dirname
    };
    res.sendFile(req.params.name, options, (err) => { next(); })
});

app.listen(port, () => {
    console.log(`App at http://localhost:${port} [${new Date().toLocaleString()}]`);
})