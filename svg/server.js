const express = require('express');
const app = express();
const dot = require("dot");
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 9090 });

const port = 8888;

const replace = {
    config: '<script src="config.js"></script>',
    wires: '<script src="wires.js"></script>',
    css: '<link rel="stylesheet" href="index.css">'
};

const files = {
    config: '<script>' +
        fs.readFileSync(path.resolve(__dirname, 'config.js'), 'utf8') +
    '</script>',
    wires: '<script>' +
        fs.readFileSync(path.resolve(__dirname, 'wires.js'), 'utf8') +
    '</script>',
    css: '<style>' +
        fs.readFileSync(path.resolve(__dirname, 'index.css'), 'utf8') +
    '</style>'
};

var templateFromHTML = fs.readFileSync(
    path.resolve(__dirname, 'index.html'), 'utf8'
);

Object.keys(replace).forEach(key => {
    templateFromHTML = templateFromHTML.replace(replace[key], `{{=it.${key}}}`);
});

const render = dot.template(templateFromHTML);

app.get('/', (req, res) => {
    const rendered = render(files);
  res.send(rendered);
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