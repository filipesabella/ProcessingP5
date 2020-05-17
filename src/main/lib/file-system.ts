import * as settings from './settings';

const remote = window.require('electron').remote;
const fs = remote.require('fs');
const path = remote.require('path');

const currentSketchPath = () => settings.getCurrentSketchPath();

let currentFile = settings.sketchMainFile;

const defaultSketchContent = `function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  rect(10, 10, 100, 100);
}
`;

export function currentSketchFileNames(): string[] {
  return fs.readdirSync(currentSketchPath()) as string[];
}

export function readSketchMainFile(): string {
  return readSketchFile(settings.sketchMainFile);
}

export function readSketchFile(f: string): string {
  currentFile = f;
  return fs
    .readFileSync(path.join(currentSketchPath(), f))
    .toString();
}

export function writeCurrentFile(content: string): void {
  fs.writeFileSync(
    path.join(currentSketchPath(), currentFile),
    content);
}

export function p5TypeDefinitions(): string {
  const basePath = remote.app.getAppPath();
  return fs.readFileSync(`${basePath}/assets/p5.d.ts`).toString();
}

export function currentOpenFile(): string {
  return currentFile;
}

export function deleteSketchFile(f: string): boolean {
  try {
    fs.unlinkSync(path.join(currentSketchPath(), f));
    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export function renameSketchFile(
  orignalName: string,
  newName: string): boolean {
  try {
    fs.renameSync(
      path.join(currentSketchPath(), orignalName),
      path.join(currentSketchPath(), newName));
    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export function createSketchFile(newName: string): boolean {
  try {
    fs.writeFileSync(path.join(currentSketchPath(), newName), '');
    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export function createNewSketch(name: string): boolean {
  try {
    const newPath = path.join(
      settings.getBaseSketchesPath(),
      name);

    fs.mkdirSync(newPath);
    fs.writeFileSync(
      path.join(newPath, settings.sketchMainFile),
      defaultSketchContent);

    settings.setCurrentSketchPath(newPath);

    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export function renameSketch(name: string): boolean {
  try {
    const newPath = path.join(
      settings.getBaseSketchesPath(),
      name);

    fs.renameSync(settings.getCurrentSketchPath(), newPath);

    settings.setCurrentSketchPath(newPath);

    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export function openSketch(name: string): boolean {
  try {
    const newPath = path.join(
      settings.getBaseSketchesPath(),
      name);

    settings.setCurrentSketchPath(newPath);

    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export function listSketches(): string[] {
  return (fs.readdirSync(settings.getBaseSketchesPath()) as string[]);
}

const p5scripts = [
  `${remote.app.getAppPath()}/assets/p5.js`,
  `${remote.app.getAppPath()}/assets/p5.sound.js`,
];
const indexTemplatePath = `${remote.app.getAppPath()}/assets/index.html`;

export function buildIndexHtml(): void {
  const scripts = p5scripts
    .map(s => `<script src="file://${s}"></script>`)
    .concat(
      currentSketchFileNames()
        .filter(isScriptFile)
        .map(s => `<script src="${s}"></script>`))
    .join('\n');

  const indexTemplate = fs
    .readFileSync(indexTemplatePath)
    .toString();

  const src = indexTemplate
    .replace('$scripts', scripts)
    .replace('$title', sketchName());

  fs.writeFileSync(
    path.join(settings.getCurrentSketchPath(), 'index.html'),
    src);
}

export function exportSketch(directory: string): void {
  const p5scripts = [
    `${remote.app.getAppPath()}/assets/p5.js`,

    // the sound library breaks the sketch bundle running as a file
    //`${remote.app.getAppPath()}/assets/p5.sound.js`,
  ];

  const currentSketchScripts =
    (fs.readdirSync(currentSketchPath()) as string[])
      .filter(isScriptFile)
      .map(s => path.join(currentSketchPath(), s));

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
    path.join(directory, `${sketchName}.html`),
    { flags: 'w' });

  for (let line of src) {
    stream.write(line + '\n');
  }
}

export function isScriptFile(s: string): boolean {
  return s.endsWith('.js');
}

function sketchName(): string {
  return path.basename(settings.getCurrentSketchPath());
}
