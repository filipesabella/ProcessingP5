import { BrowserWindow } from 'electron';
import * as windows from '../lib/browser-window';
import * as fs from '../lib/file-system';
import * as settings from '../lib/settings';
import * as sketch from '../lib/sketch';

const windowStateKeeper = require('../../electron/window-state-manager');

const { remote, ipcRenderer } = window.require('electron');

export function openPreviewWindow() {
  sketch.buildIndexHtml();

  // close any current open windows
  windows.toPreview(w => !w.isDestroyed() && w.close());

  const win = buildBrowserWindow();
  win.on('resize', win.reload);

  const toggleFullScreen = () => {
    win.setFullScreen(!win.isFullScreen());
    win.focus();
  };

  const exitFullScreen = () => {
    win.setFullScreen(false);
    windows.toMain(w => w.focus());
  };

  ipcRenderer.on('toggle-full-screen', toggleFullScreen);
  ipcRenderer.on('exit-full-screen', exitFullScreen);

  const fileServerStarted = (_: any, port: string) => {
    win.loadURL(`http://localhost:${port}/${fs.indexFile}`);
    win.showInactive();
  };

  ipcRenderer.send('start-file-server', settings.getCurrentSketchPath());
  ipcRenderer.on('file-server-started', fileServerStarted);

  win.on('close', () => {
    // simply reopen, this window is not meant to be closed
    ipcRenderer.removeListener('toggle-full-screen', toggleFullScreen);
    ipcRenderer.removeListener('exit-full-screen', exitFullScreen);
    ipcRenderer.removeListener('file-server-started', fileServerStarted);
    openPreviewWindow();
  });
}

export function reloadPreviewWindow(): void {
  windows.toPreview(w => w.reload());
}

export function reloadFiles(): void {
  sketch.buildIndexHtml();
  reloadPreviewWindow();
}

function buildBrowserWindow(): BrowserWindow {
  const windowState = windowStateKeeper({
    file: 'window-state-preview.json',
    defaultWidth: window.screen.availWidth / 2,
    defaultHeight: window.screen.availHeight,
  });

  const win = windowState.manage(new remote.BrowserWindow({
    modal: false,
    show: false,
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    excludedFromShownWindowsMenu: true,
    useContentSize: false,
    x: windowState.x === undefined
      ? window.screen.availWidth / 2 : windowState.x,
    y: windowState.y === undefined ? 0 : windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
    },
  }) as BrowserWindow);

  return win;
}
