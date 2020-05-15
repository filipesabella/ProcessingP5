import monaco = require('monaco-editor/esm/vs/editor/editor.main.js');

(self as any).MonacoEnvironment = {
  getWorkerUrl: (moduleId: any, label: string) => {
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.js';
    }

    return './editor.worker.js';
  },
};

export const initEditor = () => {
  const remote = window.require('electron').remote;
  const fs = remote.require('fs');
  const basePath = remote.app.getAppPath();
  const types = fs.readFileSync(`${basePath}/assets/p5.d.ts`).toString();

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES6,
    allowNonTsExtensions: true
  });


  monaco.languages.typescript.javascriptDefaults.addExtraLib(
    types, 'filename/p5.d.ts');

  // options
  // https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditorconstructionoptions.html
  const editor =
    monaco.editor.create(document.getElementById('editor-container'), {
      fontFamily: 'RobotoMono',
      fontSize: '15px',
      theme: 'vs-dark',
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
      value: `
function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
}

function draw() {
  if (mouseIsPressed) {
    fill(0);
  } else {
    fill(255);
  }
  ellipse(mouseX, mouseY, 80, 80);
}`,
      language: 'javascript',
    });

  editor.onDidChangeModelContent((event: any) => {
    // this is necessary to not crap out importing electron on this render thread
    fs.writeFileSync(
      '//home/filipe/ProcessingJS/sketch/main.js',
      editor.getValue());
    (remote.BrowserWindow.getAllWindows() as any[]).forEach(w => {
      if (w !== remote.getCurrentWindow()) w.reload();
    });
  });
};
