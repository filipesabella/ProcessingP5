import { BrowserWindow } from 'electron';

export function openPreviewWindow() {
  // this is necessary to not crap out importing electron on this render thread
  const remote = window.require('electron').remote;
  const BW = remote.BrowserWindow;

  // for dev, close all other windows
  (BW.getAllWindows() as any[]).forEach(w => {
    if (w !== remote.getCurrentWindow()) w.close();
  });

  let win = new BW({
    parent: remote.getCurrentWindow(),
    modal: false,
    x: 1500,
    y: 0,
    height: 1000,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
    },
  }) as BrowserWindow;

  win.webContents.openDevTools();

  const fs = remote.require('fs');
  const basePath = remote.app.getAppPath();
  const template = fs.readFileSync(`${basePath}/assets/index.html`).toString();
  const scripts = `
    <script src="file://${basePath}/assets/p5.js"></script>
    <script src="file:///home/filipe/ProcessingJS/sketch/main.js"></script>
  `;
  const src = template.replace('$scripts', scripts);
  const file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(src);
  win.loadURL(file);
}
