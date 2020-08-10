const { readFileSync } = require('fs');
//const path = require("path");

const appHTML = readFileSync('app.html', 'utf8');
const {app, dialog, BrowserWindow, remote } = require('electron');

const server = require('express')();
const port = 3333;

const tree = require('./handlers/tree.js');
const file = require('./handlers/file.js');

(async () => {
  await app.whenReady();

  //next few lines to make sure window pops on top
  const win = new BrowserWindow({ width: 10, height: 10, show: false });
  win.setAlwaysOnTop(true, "floating", 1);
  win.setVisibleOnAllWorkspaces(true);
  //app.dock.hide();

  server.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });

  server.get('/tree', tree({ dialog, win }));

  server.get('/file*', file({ dialog, win }));

  server.get('/', (req, res) => {
    res.send(appHTML);
  });

  server.listen(port, () => {
    console.log(`File Service at http://localhost:${port}`)
  });

})();