import * as React from 'react';

import monaco = require('monaco-editor/esm/vs/editor/editor.main.js');

(self as any).MonacoEnvironment = {
  getWorkerUrl: (moduleId: any, label: string) => {
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.js';
    }

    return './editor.worker.js';
  },
};

// options
// https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
const editor =
  monaco.editor.create(document.getElementById('editor-container'), {
    fontFamily: 'RobotoMono',
    fontSize: '15px',
    theme: 'vs-dark',
    folding: false,
    formatOnType: true,
    highlightActiveIndentGuide: false,
    minimap: {
      enabled: false,
    },
    renderIndentGuides: false,
    value: [
      'function x() {',
      '  console.log("Hello world!");',
      '}'
    ].join('\n'),
    language: 'javascript',
  });

let currentVal = '';

editor.onDidChangeModelContent((event: any) => {
  currentVal = editor.getValue();
});

export const Editor = () => <span></span>;
