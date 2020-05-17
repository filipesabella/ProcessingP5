const {
  ipcMain
} = require('electron');


module.exports = {
  initialise
};

let server;

function initialise(mainWindow) {
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
}
