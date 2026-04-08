const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'image(1).ico'),
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);