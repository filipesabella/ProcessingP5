import * as monaco from 'monaco-editor';
import * as fs from '../lib/file-system';
import * as settings from '../lib/settings';
import { reloadPreviewWindow } from './PreviewWindow';
const { ipcRenderer } = window.require('electron');

let editor: monaco.editor.IStandaloneCodeEditor;

export const initEditor = () => {
  // this is the way to remove all the crap autocomplete suggestions,
  // but this has a bug in current monaco resulting in runtime errors.
  // monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  //   noLib: true,
  //   allowNonTsExtensions: false,
  // });

  monaco.languages.typescript.javascriptDefaults
    .addExtraLib(fs.p5TypeDefinitions(), 'filename/p5.d.ts');

  // options
  // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
  editor =
    monaco.editor.create(document.getElementById('editor-container')!, {
      value: fs.readSketchMainFile(),
      language: 'javascript',
      fontFamily: 'JetBrains Mono',
      fontSize: settings.getFontSize(),
      theme: settings.getDarkMode() ? 'vs-dark' : 'vs-light',
      folding: false,
      formatOnType: true,
      formatOnPaste: true,
      highlightActiveIndentGuide: false,
      lineNumbers: settings.getShowLineNumbers() ? 'on' : 'off',
      minimap: {
        enabled: false,
      },
      renderIndentGuides: false,
      automaticLayout: true,
    });

  editor.onDidChangeModelContent((_: any) => {
    fs.writeCurrentFile(editor.getValue());
    if (settings.getRunMode() === 'keystroke') {
      reloadPreviewWindow();
    }
  });

  settings.watchShowLineNumbers(showLineNumbers => {
    editor.updateOptions({ 'lineNumbers': showLineNumbers ? 'on' : 'off' });
  });

  ipcRenderer.on('toggle-sidebar', () => {
    window.setTimeout(() => {
      editor.layout();
    }, 500); // time to allow the sidebar animation to finish
  });

  const changeFontSize = (n: number) => {
    editor.updateOptions({ 'fontSize': n });
    settings.setFontSize(n);
  };

  ipcRenderer.on('font-size-reset', () => {
    changeFontSize(settings.defaultFontSize);
  });

  ipcRenderer.on('font-size-increase', () => {
    changeFontSize(settings.getFontSize() + 1);
  });

  ipcRenderer.on('font-size-decrease', () => {
    changeFontSize(settings.getFontSize() - 1);
  });

};

export function updateEditorContent(content: string): void {
  editor.setValue(content);
}
