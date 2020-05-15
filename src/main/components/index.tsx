import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';
import { openPreviewWindow } from './PreviewWindow';

require('typeface-jetbrains-mono');

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

window.setTimeout(openPreviewWindow, 500);

// initialise the Monaco editor. this is actually necessary
(self as any).MonacoEnvironment = {
  getWorkerUrl: (_: any, label: string) => {
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.js';
    }

    return './editor.worker.js';
  },
};
