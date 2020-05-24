import * as monaco from 'monaco-editor';
import * as windows from '../lib/browser-window';
import * as parser from '../lib/code-parser';
import * as fs from '../lib/file-system';
import * as settings from '../lib/settings';
import * as previewWindow from './PreviewWindow';
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
      renderLineHighlight: 'gutter',
      lineNumbers: settings.getShowLineNumbers() ? 'on' : 'off',
      scrollBeyondLastLine: false,
      minimap: {
        enabled: false,
      },
      renderIndentGuides: false,
      automaticLayout: true,
    });

  // there's a github issue explaining that these options must be set
  // outside of the initialisation code
  editor.getModel()!.updateOptions({
    tabSize: 2,
    insertSpaces: true,
    indentSize: 2,
  });

  editor.onDidChangeModelContent(handleEditorChange);

  // this comes all the way from the PreviewWindow index.html
  ipcRenderer.on('js-error', (_: any, error: any) => {
    const { filename, message, lineno, colno } = error;

    const sketchFileName = filename.split('/').pop();
    const isCurrentFile = fs.currentOpenFile() === sketchFileName;
    if (isCurrentFile && !settings.getHotCodeReload()) {
      monaco.editor.setModelMarkers(editor.getModel()!, 'owner', [{
        startLineNumber: lineno,
        startColumn: colno,
        endLineNumber: lineno,
        endColumn: 99,
        message,
        severity: monaco.MarkerSeverity.Error
      }]);
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

function handleEditorChange(_: any): void {
  monaco.editor.setModelMarkers(editor.getModel()!, 'owner', []);

  const text = editor.getValue();
  fs.writeCurrentFile(text);

  if (settings.getHotCodeReload()) {
    const currentFile = fs.currentOpenFile();

    try {
      if (parser.codeHasChanged(currentFile, text)) {
        previewWindow.reloadPreviewWindow();
      } else {
        windows.toPreview(w => w.webContents.send('vars-updated',
          JSON.stringify({
            vars: parser.getVars(text),
          })));
      }
    } catch (error) {
      // if the code is currently invalid, we get an exception here from
      // the parser.codeHasChanged call.
      // these errors are benign, as the user is currently editing the text,
      // and we shold just ignore it.
      console.log(error);
    }
  } else if (settings.getRunMode() === 'keystroke') {
    previewWindow.reloadPreviewWindow();
  }
}
