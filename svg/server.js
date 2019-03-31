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
    engine: '<script src="engine.js"></script>',
    reload: '<script id="local-live-reload"></script>'
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
    '\n</script>\n',
    reload: '\n<script>\n' +
        'window.reloadVerbose = false;\n' +
        fs.readFileSync(path.resolve(__dirname, 'reload-client.js'), 'utf8') +
    '\n</script>\n',
});

var templateFromHTML = fs.readFileSync(
    path.resolve(__dirname, 'index.html'), 'utf8'
);

Object.keys(replace).forEach(key => {
    templateFromHTML = templateFromHTML.replace(replace[key], `{{=it.${key}}}`);
});

const render = (callback) => {
    buildEngine((err, engine) => {
        if(err){
            callback(JSON.stringify(err));
            return;
        }
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