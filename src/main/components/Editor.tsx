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

  function createDependencyProposals() {
    // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
    // here you could do a server side lookup
    return [{
      label: 'ellipse',
      kind: monaco.languages.CompletionItemKind.Function,
      documentation:
        `ellipse(x, y, w, h?)
        ellipse(x, y, w, h, detail)

        Parameters:
            x Number: x-coordinate of the ellipse.
            y Number: y-coordinate of the ellipse.
            w Number: width of the ellipse.
            h Number: height of the ellipse. (Optional)
            detail Integer: number of radial sectors to draw (for WebGL mode)

            Draws an ellipse (oval) to the screen. An ellipse with equal width and
          height is a circle. By default, the first two parameters set the
          location, and the third and fourth parameters set the shape's width and
          height. If no height is specified, the value of width is used for both
          the width and height. If a negative height or width is specified, the
          absolute value is taken. The origin may be changed with the
          ellipseMode() function.`,
      insertText: 'ellipse',
    }];
  }

  monaco.languages.registerCompletionItemProvider('javascript', {
    provideCompletionItems: () => {
      return {
        suggestions: createDependencyProposals()
      };
    }
  });


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
      value: `
function setup() {
  createCanvas(640, 480);
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
    const remote = window.require('electron').remote;
    const fs = remote.require('fs');
    fs.writeFileSync(
      '//home/filipe/ProcessingJS/sketch/main.js',
      editor.getValue());
    (remote.BrowserWindow.getAllWindows() as any[]).forEach(w => {
      if (w !== remote.getCurrentWindow()) w.reload();
    });
  });
};
