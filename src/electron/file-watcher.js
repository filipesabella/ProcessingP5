const {
  ipcMain
} = require('electron');
const chokidar = require('chokidar');

module.exports = {
  initialise
};

function initialise(mainWindow) {
  let watcher;

  ipcMain.on('watch-files', (_, directory) => {
    console.log('Watching ' + directory);
    watcher = chokidar.watch(directory, {
      // ignore files that start with a `.`
      ignored: /\.(.*)\..*$/
    }).on('all', (event, path) => {
      console.log(event, path);
      switch (event) {
        case 'change':
          mainWindow.webContents.send('file-changed', path);
          break;
        default:
          mainWindow.webContents.send('reload-files', path);
      }
    });
  });

  ipcMain.on('unwatch-files', async () => {
    console.log('Unwatching all files');
    await watcher && watcher.close();
  });
}
