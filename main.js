const electron = require('electron');

const {
  app,
  BrowserWindow,
} = electron;

const path = require('path');
const url = require('url');
const windowStateKeeper = require('electron-window-state');

// Let electron reloads by itself when webpack watches changes in ./app/
if (process.env.ELECTRON_START_URL) {
  require('electron-reload')(__dirname);
}

// To avoid being garbage collected
let mainWindow;

app.on('ready', () => {
  const monitor = electron.screen.getPrimaryDisplay();
  const mainWindowState = windowStateKeeper({
    file: 'mainWindow.json',
    x: monitor.size.width,
    y: 0,
    defaultWidth: 0,
    defaultHeight: monitor.size.height,
  });
  mainWindow = new BrowserWindow({
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true,
    },
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
  });
  mainWindowState.manage(mainWindow);

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, './build/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);
  mainWindow.openDevTools();

  mainWindow.on('closed', () => mainWindow = null);
});

app.on('window-all-closed', () => app.quit());
app.on('activate', () => mainWindow === null && createWindow());
