import { BrowserWindow } from 'electron';
import * as windows from '../lib/browser-window';
import * as fs from '../lib/file-system';

const windowStateKeeper = window.require('electron-window-state');
const electron = window.require('electron');
const remote = electron.remote;

export function openPreviewWindow() {
  // close any current open windows
  windows.toPreview(w => !w.isDestroyed() && w.close());

  const win = buildBrowserWindow();
  win.loadURL(buildHTMLFile());
  win.showInactive();
}

export function reloadPreviewWindow(): void {
  // not allowing the preview window to be closed just wasn't working with
  // Electron, so we added this garbage here instead.
  if (remote.BrowserWindow.getAllWindows().length === 1) {
    openPreviewWindow();
  } else {
    windows.toPreview(w => w.reload());
  }
}

export function reloadFiles(): void {
  windows.toPreview(w => w.loadURL(buildHTMLFile()));
}

function buildBrowserWindow(): BrowserWindow {
  const windowState = windowStateKeeper({
    defaultWidth: window.screen.availWidth / 2,
    defaultHeight: window.screen.availHeight,
  });

  const win = new remote.BrowserWindow({
    file: 'previewWindow.json',
    parent: remote.getCurrentWindow(),
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

  win.on('resize', () => win.reload());

  return win;
}

function buildHTMLFile(): string {
  const scripts = [fs.p5Path()].concat(fs.currentSketchFiles())
    .map(s => `<script src="file://${s}"></script>`)
    .join('\n');

  const src = fs.readIndexTemplate().replace('$scripts', scripts);
  return 'data:text/html;charset=UTF-8,' + encodeURIComponent(src);
}

