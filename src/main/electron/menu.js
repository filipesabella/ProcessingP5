const {
  Menu,
} = require('electron');

module.exports = {
  initialise
};

function initialise(mainWindow) {
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

  if (!isMac) {
    // view menu
    template[2].submenu.push({
      label: 'Auto-hide menu bar',
      click: () => mainWindow.webContents.send('auto-hide-menu-bar'),
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
