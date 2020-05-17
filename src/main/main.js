const electron = require('electron');

const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
} = electron;

const fs = require('fs');
const path = require('path');
const url = require('url');
const windowStateKeeper = require('electron-window-state');

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
    file: 'window-state-main.json',
    defaultWidth: monitor.size.width / 2,
    defaultHeight: monitor.size.height,
  });

  mainWindow = new BrowserWindow({
    show: false,
    x: mainWindowState.x === undefined ? 0 : mainWindowState.x,
    y: mainWindowState.y === undefined ? 0 : mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    // perhaps this should be a user option
    // autoHideMenuBar: true,
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
  // mainWindow.webContents.openDevTools();

  mainWindow.on('page-title-updated', e => {
    // alow the app to change the title
    e.preventDefault();
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.once('closed', () =>
    BrowserWindow.getAllWindows().forEach(w => w.close()));
}

// file server stuff

let server;

function startFileServer(path) {
  const static = require('node-static');
  const file = new static.Server(path);

  if (server) {
    server.close();
  }

  server = require('http').createServer((request, response) => {
    request.addListener('end', () => {
      file.serve(request, response);
    }).resume();
  });

  server.listen(0, () => {
    const port = server.address().port;
    mainWindow.webContents.send('file-server-started', port);
  });
}

ipcMain.on('start-file-server', (event, arg) => {
  startFileServer(arg);
});


// menu stuff

const isMac = process.platform === 'darwin';

const template = [{
  label: 'ProcessingP5',
  submenu: [{
    label: 'New Sketch',
    accelerator: isMac ? 'Cmd+Shift+N' : 'Ctrl+Shift+N',
    click: () => mainWindow.webContents.send('new-sketch'),
  }, {
    label: 'Open Sketch',
    accelerator: isMac ? 'Cmd+O' : 'Ctrl+O',
    click: () => mainWindow.webContents.send('open-sketch'),
  }, {
    type: 'separator'
  }, {
    label: 'Preferences',
    accelerator: isMac ? 'Cmd+,' : 'Ctrl+,',
    click: () => mainWindow.webContents.send('open-preferences'),
  }]
}, {
  label: 'Sketch',
  submenu: [{
    label: 'Run',
    accelerator: 'Ctrl+R',
    click: () => mainWindow.webContents.send('reload'),
  }, {
    label: 'New File',
    accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
    click: () => mainWindow.webContents.send('new-file'),
  }, {
    type: 'separator'
  }, {
    label: 'Next File',
    accelerator: 'Ctrl+Tab',
    click: () => mainWindow.webContents.send('next-file'),
  }, {
    label: 'Previous File',
    accelerator: 'Ctrl+Shift+Tab',
    click: () => mainWindow.webContents.send('previous-file'),
  }, {
    type: 'separator'
  }, {
    label: 'Rename Sketch',
    accelerator: isMac ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
    click: () => mainWindow.webContents.send('rename-sketch'),
  }]
}, {
  label: 'View',
  submenu: [{
    label: 'Toggle Sidebar',
    accelerator: 'Alt+/',
    click: () => mainWindow.webContents.send('toggle-sidebar'),
  }, {
    label: 'Toggle developer tools',
    accelerator: 'Ctrl+Shift+J',
    click: () => mainWindow.webContents.send('toggle-dev-tools'),
  }, {
    type: 'separator'
  }, {
    label: 'Toggle Full Screen',
    accelerator: 'Ctrl+Shift+F',
    click: () => mainWindow.webContents.send('toggle-full-screen'),
  }, {
    label: 'Exit Full Screen',
    accelerator: 'Esc',
    click: () => mainWindow.webContents.send('exit-full-screen'),
  }, {
    type: 'separator'
  }, {
    label: 'Increase font size',
    accelerator: 'Ctrl+Shift+=',
    click: () => mainWindow.webContents.send('font-size-increase'),
  }, {
    label: 'Decrease font size',
    accelerator: 'Ctrl+Shift+-',
    click: () => mainWindow.webContents.send('font-size-decrease'),
  }, {
    label: 'Reset font size',
    accelerator: 'Ctrl+Shift+0',
    click: () => mainWindow.webContents.send('font-size-reset'),
  }],
}, {
  label: 'Dev',
  submenu: [{
    label: 'Developer Tools',
    accelerator: 'F12',
    click: () => mainWindow.webContents.toggleDevTools(),
  }],
}, ];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.on('window-all-closed', app.quit);
app.on('ready', () => {
  createWindow();
});
