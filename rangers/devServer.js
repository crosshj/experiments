var port = 9090;

const WebSocket = require('ws');
const { exec } = require('child_process');

const wss = new WebSocket.Server({ port });
var ws;

function sendMessage(msg) {
    ws.send(msg);
}

function update(files){
    exec('node ./most_used.js', (err, stdout, stderr) => {
        sendMessage(err || stdout);
    });
}

wss.on('connection', function connection(socket) {
    ws = socket;
    ws.on('message', function incoming(message) {
        console.log(`received: ${message}`);
    });

    ws.on('open', function open() {
        console.log('connected');
        //ws.send(Date.now());
    });

    ws.on('close', function close() {
        //console.log('disconnected');
    });
    update();
});

console.log(`Websocket on port: ${port}`);


var nodemon = require('nodemon');
nodemon({
    script: 'doNothing.js',
    ext: 'js json htm html'
});

nodemon
    .on('start', update)
    .on('quit', function () {
        console.log('App has quit');
        process.exit();
    })
    .on('restart', update);