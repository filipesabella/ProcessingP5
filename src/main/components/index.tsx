import * as React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';

import { BrowserWindow, remote } from 'electron';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);


function openModal() {
  let win = new BrowserWindow({});
  //   // parent: remote.getCurrentWindow(),
  //   modal: true,
  //   webPreferences: {
  //     nodeIntegration: true,
  //   },
  // });

  // // var theUrl = 'file://' + __dirname + '/modal.html'
  // // console.log('url', theUrl);

  // // win.loadURL(theUrl);
  // const pageContent = `
  //   <html><body>asd</body></html>`;

  // win.loadURL('data:text/html;charset=UTF-8,' +
  //   encodeURIComponent(pageContent), {
  //     baseURLForDataURL: `file://${__dirname}/app/`
  //   });
}
console.log('???????');
(window as any).openModal = openModal;
