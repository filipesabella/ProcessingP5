import * as monaco from 'monaco-editor';
import { p5TypeDefinitions, readSketchMainFile, writeCurrentFile } from '../lib/file-system';
import { reloadPreviewWindow } from './PreviewWindow';

let editor: monaco.editor.IStandaloneCodeEditor;

export const initEditor = () => {
  // this is the way to remove all the crap autocomplete suggestions,
  // but this has a bug in current monaco resulting in runtime errors.
  // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  //   noLib: true,
  //   allowNonTsExtensions: false,
  // });

  monaco.languages.typescript.javascriptDefaults
    .addExtraLib(p5TypeDefinitions(), 'filename/p5.d.ts');

  // options
  // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
  editor =
    monaco.editor.create(document.getElementById('editor-container')!, {
      value: readSketchMainFile(),
      language: 'javascript',
      fontFamily: 'JetBrains Mono',
      fontSize: 16,
      theme: 'vs-dark',
      // theme: 'vs-light',
      folding: false,
      formatOnType: true,
      formatOnPaste: true,
      highlightActiveIndentGuide: false,
      lineNumbers: 'on',
      minimap: {
        enabled: false,
      },
      renderIndentGuides: false,
      automaticLayout: true,
    });

  editor.onDidChangeModelContent((_: any) => {
    writeCurrentFile(editor.getValue());
    reloadPreviewWindow();
  });
};

export function updateEditorContent(content: string): void {
  editor.setValue(content);
}
