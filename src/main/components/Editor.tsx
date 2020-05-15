import monaco = require('monaco-editor/esm/vs/editor/editor.main.js');
import { p5TypeDefinitions, readSketchMainFile, writeCurrentFile } from '../lib/file-system';
import { reloadPreviewWindow } from './PreviewWindow';

(self as any).MonacoEnvironment = {
  getWorkerUrl: (moduleId: any, label: string) => {
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.js';
    }

    return './editor.worker.js';
  },
};

export const initEditor = () => {
  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    noLib: false,
    target: monaco.languages.typescript.ScriptTarget.ES6,
    allowNonTsExtensions: true
  });

  monaco.languages.typescript.javascriptDefaults
    .addExtraLib(p5TypeDefinitions(), 'filename/p5.d.ts');

  // options
  // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
  const editor =
    monaco.editor.create(document.getElementById('editor-container'), {
      value: readSketchMainFile(),
      fontFamily: 'RobotoMono',
      fontSize: '15px',
      theme: 'vs-dark', // vs-light
      folding: false,
      formatOnType: true,
      formatOnPaste: true,
      highlightActiveIndentGuide: false,
      lineNumbers: true,
      minimap: {
        enabled: false,
      },
      renderIndentGuides: false,
      automaticLayout: true,
      language: 'javascript',
    });

  editor.onDidChangeModelContent((e: any) => {
    writeCurrentFile(editor.getValue());
    reloadPreviewWindow();
  });
};
