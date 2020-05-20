import * as parser from './code-parser';
import * as fileSystem from './file-system';
import * as settings from './settings';

const remote = window.require('electron').remote;
const fs = remote.require('fs');
const path = remote.require('path');

const p5scripts = [
  `${remote.app.getAppPath()}/assets/p5.js`,
  `${remote.app.getAppPath()}/assets/p5.sound.js`,
];

const indexTemplate = fs
  .readFileSync(`${remote.app.getAppPath()}/assets/index.html`)
  .toString();

export function buildIndexHtml(): void {
  const currentPath = settings.getCurrentSketchPath();
  const dependencies = p5scripts
    .map(s => `<script src="file://${s}"></script>`);

  const scriptFiles = fileSystem.currentSketchFileNames()
    .filter(isScriptFile);

  const sketchScripts = settings.getHotCodeReload()
    ? scriptFiles.map(scriptForHotReload(currentPath))
    : scriptFiles.map(s => `<script src="${s}"></script>`);

  const src = indexTemplate
    .replace('$scripts', dependencies.concat(sketchScripts).join('\n'))
    .replace('$title', sketchName());

  fs.writeFileSync(
    path.join(currentPath, fileSystem.indexFile),
    src);
}

/**
 * Given a sketch's file, parses the contents using the code-parser
 * and writes the parsed code to ('.' + originalFileName).
 *
 * By starting the file name with a '.', it's going to be hidden for
 * most users and we can serve those files using our local file server.
 */
const scriptForHotReload = (currentPath: string) =>
  (fileName: string): string => {
    const originalFilePath = path.join(currentPath, fileName);
    const code = fs.readFileSync(originalFilePath).toString();
    const parsedFileName = `.${fileName}`;
    const parsedCode = parser.parseCode(fileName, code);
    const parsedFilePath = path.join(currentPath, parsedFileName);
    fs.writeFileSync(parsedFilePath, parsedCode);
    return `<script src="${parsedFileName}"></script>`;
  };

export function exportSketch(directory: string): void {
  const p5scripts = [
    `${remote.app.getAppPath()}/assets/p5.js`,

    // the sound library breaks the sketch bundle running as a file
    //`${remote.app.getAppPath()}/assets/p5.sound.js`,
  ];

  const currentSketchScripts =
    (fs.readdirSync(settings.getCurrentSketchPath()) as string[])
      .filter(isScriptFile)
      .map(s => path.join(settings.getCurrentSketchPath(), s));

  const scripts =
    p5scripts.concat(currentSketchScripts)
      .map(f => fs.readFileSync(f).toString())
      .join('\n');

  const src = `
    <html>
      <head>
        <title>${sketchName()}</title>
        <style>html, body { margin: 0; padding: 0; }</style>
        <script>
          ${scripts}
        </script>
      </head>
      <body></body>
    </html>
  `.split('\n');

  const stream = fs.createWriteStream(
    path.join(directory, `${sketchName()}.html`),
    { flags: 'w' });

  for (let line of src) {
    stream.write(line + '\n');
  }
}

function sketchName(): string {
  return path.basename(settings.getCurrentSketchPath());
}

export function isScriptFile(s: string): boolean {
  return s.endsWith('.js') && !s.startsWith('.');
}
