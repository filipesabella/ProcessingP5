const electron = require('electron');
const path = require('path');

const {
  app,
  Notification,
} = electron;

const {
  autoUpdater
} = require('electron-updater');

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

  require('./file-server.js').initialise(mainWindow);
  require('./menu.js').initialise(mainWindow);

  checkForUpdates();
});

function checkForUpdates() {
  if (process.env.DEV_MODE !== 'true') {
    const log = require('electron-log');
    log.transports.file.level = 'debug';
    autoUpdater.logger = log;

    autoUpdater.on('update-available', (info) => {
      log.log(info);

      new Notification(
        'A new version of ProcessingP5 is available!', {
          body: 'If you want new features, bug fixes, and get rid of this ' +
            'annoying message, head on to the website to download the new version.'
        }).onclick = () => {
        console.log('Eventually add a link to the website here.');
      };
    });

    autoUpdater.checkForUpdates();
  }
}
