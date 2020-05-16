const electron = require('electron');

const {
  app,
  BrowserWindow,
  Menu,
  MenuItem,
} = electron;

const fs = require('fs');
const path = require('path');
const url = require('url');
const windowStateKeeper = require('electron-window-state');
const settings = require('electron-settings');

if (process.env.ELECTRON_START_URL) {
  require('electron-reload')(
    path.join(__dirname, '../../dist'), {
      // this enables hard resets, don't know if I need it
      //electron: '../../dist'
    });
}

let mainWindow;

function createWindow() {
  const monitor = electron.screen.getPrimaryDisplay();
  const mainWindowState = windowStateKeeper({
    file: 'mainWindow.json',
    defaultWidth: monitor.size.width / 2,
    defaultHeight: monitor.size.height,
  });

  mainWindow = new BrowserWindow({
    show: false,
    x: mainWindowState.x === undefined ? 0 : mainWindowState.x,
    y: mainWindowState.y === undefined ? 0 : mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    webPreferences: {
      webSecurity: true,
      nodeIntegration: true,
    },
  });
  mainWindowState.manage(mainWindow);

  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../../dist/index.html'),
    protocol: 'file',
    slashes: true,
  });

  mainWindow.loadURL(startUrl);
  mainWindow.webContents.openDevTools();

  mainWindow.once('ready-to-show', () => mainWindow.showInactive());
}

const template = [{
  label: 'File',
  submenu: [{
    label: 'New Sketch',
    accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
    click: () => mainWindow.webContents.send('new-sketch'),
  }, {
    label: 'Rename Sketch',
    accelerator: process.platform === 'darwin' ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
    click: () => mainWindow.webContents.send('rename-sketch'),
  }, {
    label: 'Open Sketch',
    accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
    click: () => mainWindow.webContents.send('open-sketch'),
  }, {
    type: 'separator'
  }, {
    label: 'Preferences',
    accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Ctrl+,',
    click: () => mainWindow.webContents.send('open-preferences'),
  }]
}, {
  label: 'View',
  submenu: [{
    label: 'Toggle developer tools',
    accelerator: process.platform === 'darwin' ? 'Cmd+Shift+I' : 'Ctrl+shift+I',
    click: () => mainWindow.webContents.send('toggle-dev-tools'),
  }, {
    type: 'separator'
  }, {
    role: 'resetzoom'
  }, {
    role: 'zoomin'
  }, {
    role: 'zoomout'
  }]
}, ];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.on('window-all-closed', app.quit);
app.on('ready', () => {
  createWindow();
});
