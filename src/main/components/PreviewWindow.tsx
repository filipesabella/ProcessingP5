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
    ipcRenderer.removeListener('toggle-full-screen', toggleFullScreen);
    ipcRenderer.removeListener('exit-full-screen', exitFullScreen);
    ipcRenderer.removeListener('file-server-started', fileServerStarted);

    // simply reopen, this window is not meant to be closed
    openPreviewWindow();
  });
}

export function reloadPreviewWindow(): void {
  if (settings.getHotCodeReload()) {
    sketch.buildIndexHtml();
  }

  windows.toPreview(w => w.reload());
}

export function reloadFiles(): void {
  sketch.buildIndexHtml();
  windows.toPreview(w => w.reload());
}

function buildBrowserWindow(): BrowserWindow {
  const windowState = windowStateKeeper({
    file: 'window-state-preview.json',
    defaultWidth: Math.floor(window.screen.availWidth / 2),
    defaultHeight: Math.floor(window.screen.availHeight),
  });

  const win = windowState.manage(new remote.BrowserWindow({
    modal: false,
    show: false,
    autoHideMenuBar: true,
    excludedFromShownWindowsMenu: true,
    useContentSize: false,
    x: Math.floor(windowState.x === undefined
      ? window.screen.availWidth / 2 : windowState.x),
    y: Math.floor(windowState.y === undefined ? 0 : windowState.y),
    width: Math.floor(windowState.width),
    height: Math.floor(windowState.height),
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
    },
  }) as BrowserWindow) as BrowserWindow;

  // doing this has a different behaviour than adding it to the constructor
  win.setParentWindow(windows.main());

  return win;
}
