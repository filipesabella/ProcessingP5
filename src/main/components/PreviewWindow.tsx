import { BrowserWindow } from 'electron';
import * as windows from '../lib/browser-window';
import * as fs from '../lib/file-system';
import * as settings from '../lib/settings';

const windowStateKeeper = window.require('electron-window-state');
const { remote, ipcRenderer } = window.require('electron');

// import * as http from 'http';
const http = window.require('http');

export function openPreviewWindow() {
  buildHTMLFile();

  // close any current open windows
  windows.toPreview(w => !w.isDestroyed() && w.close());

  const win = buildBrowserWindow();
  win.on('resize', win.reload);

  const enterFullScreen = () => {
    win.setFullScreen(true);
    win.focus();
  };

  const exitFullScreen = () => {
    win.setFullScreen(false);
    windows.main().focus();
  };

  ipcRenderer.on('toggle-full-screen', enterFullScreen);
  ipcRenderer.on('exit-full-screen', exitFullScreen);

  const fileServerStarted = (_: any, port: string) => {
    console.log('woohoo', port);
    win.loadURL(`http://localhost:${port}/index.html`);
    win.showInactive();
  };

  ipcRenderer.send('start-file-server', settings.getCurrentSketchPath());
  ipcRenderer.on('file-server-started', fileServerStarted);

  win.on('closed', () => {
    ipcRenderer.removeListener('toggle-full-screen', enterFullScreen);
    ipcRenderer.removeListener('exit-full-screen', exitFullScreen);
    ipcRenderer.removeListener('file-server-started', fileServerStarted);
    openPreviewWindow();
  });
}

export function reloadPreviewWindow(): void {
  windows.toPreview(w => w.reload());
}

export function reloadFiles(): void {
  buildHTMLFile();
  reloadPreviewWindow();
}

function buildBrowserWindow(): BrowserWindow {
  const windowState = windowStateKeeper({
    file: 'window-state-preview.json',
    defaultWidth: window.screen.availWidth / 2,
    defaultHeight: window.screen.availHeight,
  });

  const win = new remote.BrowserWindow({
    modal: false,
    show: false,
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    closable: false, // does not work on linux
    excludedFromShownWindowsMenu: true,
    x: windowState.x === undefined
      ? window.screen.availWidth / 2 : windowState.x,
    y: windowState.y === undefined ? 0 : windowState.y,
    width: windowState.width,
    height: windowState.height,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
    },
  }) as BrowserWindow;

  windowState.manage(win);

  return win;
}

function buildHTMLFile(): void {
  const scripts = fs.p5Paths().concat(fs.currentSketchFiles())
    .map(s => `<script src="file://${s}"></script>`)
    .join('\n');

  const src = fs.readIndexTemplate().replace('$scripts', scripts);
  fs.writeIndexFile(src);
}

