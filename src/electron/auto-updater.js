const {
  dialog
} = require('electron');
const {
  autoUpdater
} = require('electron-updater');

autoUpdater.autoDownload = false;

autoUpdater.on('error', (error) => {
  dialog.showErrorBox('Error: ', error == null ?
    'unknown' :
    (error.stack || error).toString());
})

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Found Updates',
    message: 'Found updates, do you want update now?',
    buttons: ['Sure', 'No']
  }, (buttonIndex) => {
    if (buttonIndex === 0) {
      autoUpdater.downloadUpdate();
    } else {
      updater.enabled = true;
      updater = null;
    }
  })
})

autoUpdater.on('update-not-available', () => {
  dialog.showMessageBox({
    title: 'No Updates',
    message: 'Current version is up-to-date.'
  });
  updater.enabled = true;
  updater = null;
})

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox({
    title: 'Install Updates',
    message: 'Updates downloaded, application will restart'
  }, () => {
    setImmediate(() => autoUpdater.quitAndInstall());
  })
})

module.exports.checkForUpdates = () => {
  autoUpdater.checkForUpdates();
}

autoUpdater.checkForUpdates();
