import { BrowserWindow } from 'electron';
import { currentSketchFiles, p5Path, readIndexTemplate } from '../lib/file-system';

const remote = window.require('electron').remote;

export function openPreviewWindow() {
  // close any current open windows
  applyToPreviewWindow(w => !w.isDestroyed() && w.close());

  const win = new remote.BrowserWindow({
    parent: remote.getCurrentWindow(),
    modal: false,
    x: 1500,
    y: 500,
    height: 1000,
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    closable: false, // does not work
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
    },
  }) as BrowserWindow;

  const scripts = [p5Path()].concat(currentSketchFiles())
    .map(s => `<script src="${s}"></script>`)
    .join('\n');

  const src = readIndexTemplate().replace('$scripts', scripts);
  const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(src);

  win.loadURL(file);

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

function applyToPreviewWindow(fn: (w: BrowserWindow) => void): void {
  (remote.BrowserWindow.getAllWindows() as BrowserWindow[])
    // the main editor window always gets id = 1
    .forEach(w => w.id !== 1 && fn(w));
}
