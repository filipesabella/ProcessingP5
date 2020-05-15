const electron = require('electron');

const {
  app,
  BrowserWindow,
  Menu,
  dialog,
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
  const width = monitor.size.width / (monitor.size.width > 2000 ? 3 : 2);
  const mainWindowState = windowStateKeeper({
    defaultWidth: width,
    defaultHeight: monitor.size.height,
  });
  mainWindow = new BrowserWindow({
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true,
    },
    width: mainWindowState.width,
    height: mainWindowState.height,
    x: mainWindowState.x,
    y: mainWindowState.y,
  });
  mainWindowState.manage(mainWindow);

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, './build/index.html'),
    protocol: 'file:',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);
  mainWindow.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  }
});
