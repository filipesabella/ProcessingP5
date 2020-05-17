import { BrowserWindow } from 'electron';
import * as windows from '../lib/browser-window';
import * as fs from '../lib/file-system';

const windowStateKeeper = window.require('electron-window-state');
const { remote, ipcRenderer } = window.require('electron');

export function openPreviewWindow() {
  // close any current open windows
  windows.toPreview(w => !w.isDestroyed() && w.close());

  const win = buildBrowserWindow();
  win.loadURL(buildHTMLFile());
  win.showInactive();

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
  win.on('closed', () => {
    ipcRenderer.removeListener('toggle-full-screen', enterFullScreen);
    ipcRenderer.removeListener('exit-full-screen', exitFullScreen);
    openPreviewWindow();
  });
}

export function reloadPreviewWindow(): void {
  windows.toPreview(w => w.reload());
}

export function reloadFiles(): void {
  windows.toPreview(w => w.loadURL(buildHTMLFile()));
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

function buildHTMLFile(): string {
  const scripts = fs.p5Paths().concat(fs.currentSketchFiles())
    .map(s => `<script src="file://${s}"></script>`)
    .join('\n');

  const src = fs.readIndexTemplate().replace('$scripts', scripts);
  return 'data:text/html;charset=UTF-8,' + encodeURIComponent(src);
}

