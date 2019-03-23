const { app, BrowserWindow } = require('electron');

// window && (window.ELECTRON_DISABLE_SECURITY_WARNINGS = true)
// window && (window.ELECTRON_ENABLE_SECURITY_WARNINGS = false)
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
process.env.ELECTRON_ENABLE_SECURITY_WARNINGS = false;
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
let win;

const createWindow = () => {
    win = new BrowserWindow({
      width: 800, height: 600,
      frame: false,
      webPreferences: {
        nodeIntegration: false
      }
    });
    win.loadURL('http://localhost:8888');
    win.webContents["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;
    win.webContents.openDevTools({
        mode: 'bottom',
        theme: 'dark'
    });
    //win.show();
    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})