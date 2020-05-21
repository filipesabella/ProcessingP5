const electron = require('electron');
const path = require('path');

const {
  app,
} = electron;

if (process.env.ELECTRON_START_URL) {
  require('electron-reload')(
    path.join(__dirname, '../../dist'), {
      // this enables hard resets, don't know if I need it
      //electron: '../../dist'
    });
}

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.allowRendererProcessReuse = true;
app.on('window-all-closed', app.quit);
app.on('ready', () => {
  const mainWindow = require('./main-window').initialise();

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  require('./file-server.js').initialise(mainWindow);
  require('./menu.js').initialise(mainWindow);
});
