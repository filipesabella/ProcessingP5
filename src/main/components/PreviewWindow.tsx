import { BrowserWindow } from 'electron';
import { currentSketchFiles, p5Path, readIndexTemplate } from '../lib/file-system';

const windowStateKeeper = window.require('electron-window-state');
const electron = window.require('electron');
const remote = electron.remote;

export function openPreviewWindow() {
  // close any current open windows
  applyToPreviewWindow(w => !w.isDestroyed() && w.close());

  const scripts = [p5Path()].concat(currentSketchFiles())
    .map(s => `<script src="${s}"></script>`)
    .join('\n');

  const src = readIndexTemplate().replace('$scripts', scripts);
  const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(src);

  const win = buildBrowserWindow();
  win.loadURL(file);
}

export function reloadPreviewWindow(): void {
  // not allowing the preview window to be closed just wasn't working with
  // Electron, so we added this garbage here instead.
  if (remote.BrowserWindow.getAllWindows().length === 1) {
    openPreviewWindow();
  } else {
    applyToPreviewWindow(w => w.reload());
  }
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
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    closable: false, // does not work
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

  win.webContents.on('console-message', (e, level, message) => {
    if (level === 1) {
      console.log(message);
    } else if (level === 2) {
      // ignore electron warn messages
      // console.warn(message);
    } else if (level === 3) {
      console.error(message);
    }
  });

  return win;
}

function applyToPreviewWindow(fn: (w: BrowserWindow) => void): void {
  (remote.BrowserWindow.getAllWindows() as BrowserWindow[])
    // the main editor window always gets id = 1
    .forEach(w => w.id !== 1 && fn(w));
}
