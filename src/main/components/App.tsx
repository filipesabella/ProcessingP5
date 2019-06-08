import * as React from 'react';

const monaco = require('monaco-editor/esm/vs/editor/editor.main.js');

import '../styles/app.less';

(self as any).MonacoEnvironment = {
  getWorkerUrl: (moduleId: any, label: string) => {
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.js';
    }
    return './editor.worker.js';
  },
};
monaco.editor.create(document.getElementById('editor-container'), {
  value: [
    'function x() {',
    '  console.log("Hello world!");',
    '}'
  ].join('\n'),
  language: 'javascript',
});

interface State {
}

export class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
  }

  public render(): React.ReactNode {
    return <div className="app">
      asd
    </div>;
  }
}
