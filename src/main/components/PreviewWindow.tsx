import { BrowserWindow } from 'electron';
import { currentSketchFiles, p5Path, readIndexTemplate } from '../lib/file-system';

// this is necessary to not crap out importing electron on this render thread
const remote = window.require('electron').remote;

export function openPreviewWindow() {
  const BW = remote.BrowserWindow;

  // for dev, close all other windows
  applyToPreviewWindow(w => w.close());

  let win = new BW({
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

  win.webContents.openDevTools();
  win.on('resize', () => win.reload());

  const scripts = [p5Path()].concat(currentSketchFiles())
    .map(s => `<script src="${s}"></script>`)
    .join('\n');

  const src = readIndexTemplate().replace('$scripts', scripts);
  const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(src);

  win.loadURL(file);
}

export function reloadPreviewWindow(): void {
  applyToPreviewWindow(w => w.reload());
}

function applyToPreviewWindow(fn: (w: any) => void): void {
  (remote.BrowserWindow.getAllWindows() as any[]).forEach(w => {
    if (w !== remote.getCurrentWindow()) fn(w);
  });
}
