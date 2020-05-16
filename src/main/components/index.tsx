import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ModalProvider } from 'react-modal-hook';
import { initSettings } from '../lib/settings';
import { App } from './App';

require('reset-css');
require('typeface-jetbrains-mono');
require('typeface-barlow');

initSettings();

ReactDOM.render(
  <ModalProvider><App /></ModalProvider>,
  document.getElementById('root')
);

// initialise the Monaco editor. this is actually necessary
(self as any).MonacoEnvironment = {
  getWorkerUrl: (_: any, label: string) => {
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.js';
    }

    return './editor.worker.js';
  },
};
