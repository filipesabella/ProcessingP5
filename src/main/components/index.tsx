import { BrowserWindow } from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);


function openModal() {
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
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
    },
  }) as BrowserWindow;

  const src = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>aaa</title>
          <meta charset="UTF-8">
        </head>
        <body>
          <div id="view">qqq</div>
        </body>
      </html>`;

  let file = 'data:text/html;charset=UTF-8,' + encodeURIComponent(src);
  win.loadURL(file);
}

window.setTimeout(() => openModal(), 500);
