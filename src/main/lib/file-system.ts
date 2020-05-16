const remote = window.require('electron').remote;
const fs = remote.require('fs');

export const sketchMainFile = 'main.js';
let currentSketchPath = '/home/filipe/ProcessingJS/sketch/';
let currentFile = sketchMainFile;

export function currentSketchFiles(): string[] {
  return (fs.readdirSync(currentSketchPath) as string[])
    .filter(s => !s.startsWith('.'))
    .map(s => currentSketchPath + s);
}

export function readSketchMainFile(): string {
  return readSketchFile(sketchMainFile);
}

export function readSketchFile(f: string): string {
  currentFile = f;
  return fs.readFileSync(currentSketchPath + f).toString();
}

export function writeCurrentFile(content: string): void {
  fs.writeFileSync(
    currentSketchPath + currentFile,
    content);
}

export function readIndexTemplate(): string {
  const path = `${remote.app.getAppPath()}/assets/index.html`;
  return fs.readFileSync(path).toString();
}

export function p5Path(): string {
  return `file://${remote.app.getAppPath()}/assets/p5.js`;
}

export function p5TypeDefinitions(): string {
  const basePath = remote.app.getAppPath();
  return fs.readFileSync(`${basePath}/assets/p5.d.ts`).toString();
}

export function currentOpenFile(): string {
  return currentFile;
}
