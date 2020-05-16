const remote = window.require('electron').remote;
const fs = remote.require('fs');

export const sketchMainFile = 'main.js';

const baseSketchesPath = '/home/filipe/ProcessingJS/';

let currentSketchPath = baseSketchesPath + '/sketch/';
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
  return `${remote.app.getAppPath()}/assets/p5.js`;
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
    fs.unlinkSync(currentSketchPath + f);
    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export function renameSketchFile(orignalName: string, newName: string): boolean {
  try {
    fs.renameSync(
      currentSketchPath + orignalName,
      currentSketchPath + newName);
    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export function createSketchFile(newName: string): boolean {
  try {
    fs.writeFileSync(currentSketchPath + newName, '');
    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export function createNewSketch(name: string): boolean {
  try {
    const newPath = baseSketchesPath + name + '/';
    fs.mkdirSync(newPath);
    fs.writeFileSync(newPath + sketchMainFile, '');

    currentSketchPath = newPath;
    currentFile = sketchMainFile;

    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}
