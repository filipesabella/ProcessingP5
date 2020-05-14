import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';
import { openPreviewWindow } from './PreviewWindow';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

window.setTimeout(openPreviewWindow, 500);
