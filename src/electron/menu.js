const {
  Menu,
  app,
} = require('electron');

// const autoUpdater = require('./auto-updater');

module.exports = {
  initialise
};

function initialise(mainWindow) {
  const isMac = process.platform === 'darwin';

  const template = [{
    label: 'ProcessingP5',
    submenu: [{
      label: 'New Sketch',
      accelerator: 'CmdOrCtrl+Shift+N',
      click: () => mainWindow.webContents.send('new-sketch'),
    }, {
      label: 'Open Sketch',
      accelerator: 'CmdOrCtrl+O',
      click: () => mainWindow.webContents.send('open-sketch'),
    }, {
      type: 'separator'
    }, {
      label: 'Preferences',
      accelerator: 'CmdOrCtrl+,',
      click: () => mainWindow.webContents.send('open-preferences'),
    }, {
      type: 'separator'
    }, {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: () => app.quit(),
    }]
  }, {
    label: 'Sketch',
    submenu: [{
      label: 'Run',
      accelerator: 'CmdOrCtrl+R',
      click: () => mainWindow.webContents.send('reload'),
    }, {
      type: 'separator'
    }, {
      label: 'New File',
      accelerator: 'CmdOrCtrl+N',
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
      label: 'Import File',
      click: () => mainWindow.webContents.send('import-file'),
    }, {
      label: 'Rename Sketch',
      accelerator: 'CmdOrCtrl+Shift+S',
      click: () => mainWindow.webContents.send('rename-sketch'),
    }, {
      type: 'separator'
    }, {
      label: 'Export',
      click: () => mainWindow.webContents.send('export-sketch'),
    }]
  }, {
    label: 'View',
    submenu: [{
      label: 'Toggle Sidebar',
      accelerator: isMac ? 'Ctrl+/' : 'Alt+/',
      click: () => mainWindow.webContents.send('toggle-sidebar'),
    }, {
      label: 'Toggle developer tools',
      accelerator: 'CmdOrCtrl+Shift+J',
      click: () => mainWindow.webContents.send('toggle-dev-tools'),
    }, {
      type: 'separator'
    }, {
      label: 'Toggle Full Screen',
      accelerator: 'CmdOrCtrl+Shift+F',
      click: () => mainWindow.webContents.send('toggle-full-screen'),
    }, {
      label: 'Exit Full Screen',
      accelerator: 'Esc',
      click: () => mainWindow.webContents.send('exit-full-screen'),
    }, {
      label: 'Auto-arrange windows',
      click: () => mainWindow.webContents.send('auto-arrange-windows'),
    }, {
      type: 'separator'
    }, {
      label: 'Increase font size',
      accelerator: 'CmdOrCtrl+Shift+=',
      click: () => mainWindow.webContents.send('font-size-increase'),
    }, {
      label: 'Decrease font size',
      accelerator: 'CmdOrCtrl+Shift+-',
      click: () => mainWindow.webContents.send('font-size-decrease'),
    }, {
      label: 'Reset font size',
      accelerator: 'CmdOrCtrl+Shift+0',
      click: () => mainWindow.webContents.send('font-size-reset'),
    }],
  }, ];

  if (process.env.DEV_MODE === 'true') {
    template.push({
      label: 'Dev',
      submenu: [{
        label: 'Developer Tools',
        accelerator: 'F12',
        click: () => mainWindow.webContents.toggleDevTools(),
      }],
    });
  }

  if (!isMac) {
    // view menu
    template[2].submenu.push({
      type: 'separator'
    }, {
      label: 'Auto-hide menu bar',
      click: () => mainWindow.webContents.send('auto-hide-menu-bar'),
    });
  } else {

    if (process.platform === 'darwin') {
      // cmd+c/v does not work without having these on the menu
      template.push({
        label: 'Edit',
        submenu: [{
          role: 'undo'
        }, {
          role: 'redo'
        }, {
          type: 'separator'
        }, {
          role: 'cut'
        }, {
          role: 'copy'
        }, {
          role: 'paste'
        }, {
          role: 'delete'
        }, {
          role: 'selectall'
        }]
      })
    }
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
