import { BrowserWindow } from 'electron';
import { currentSketchFiles, p5Path, readIndexTemplate } from '../lib/file-system';

const remote = window.require('electron').remote;

export function openPreviewWindow() {
  applyToPreviewWindow(w => {
    try {
      !w.isDestroyed() && w.close();
    } catch (e) {
      console.error('??', e);
    }
  });

  const win = new remote.BrowserWindow({
    parent: remote.getCurrentWindow(),
    modal: false,
    x: 1500,
    y: 500,
    height: 1000,
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    closable: false,
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
  win.on('close', e => {
    openPreviewWindow();
  });

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
  applyToPreviewWindow(w => w.reload());
}

function applyToPreviewWindow(fn: (w: BrowserWindow) => void): void {
  (remote.BrowserWindow.getAllWindows() as BrowserWindow[])
    .forEach(w => {
      if (w.id !== 1) {
        console.log(w.id);
        fn(w);
      }
    });
}
