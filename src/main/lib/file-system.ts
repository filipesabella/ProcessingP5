import * as settings from './settings';

const remote = window.require('electron').remote;
const fs = remote.require('fs');
const path = remote.require('path');

export const indexFile = '.index.html';

const currentSketchPath = () => settings.getCurrentSketchPath();
const defaultSketchContent = `function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  rect(10, 10, 100, 100);
}
`;

let currentFile = settings.sketchMainFile;

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
    remote.shell.moveItemToTrash(path.join(currentSketchPath(), f));
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
  const cleanUpGeneratedFile = (dir: string) => {
    try {
      (fs.readdirSync(dir) as string[]).forEach(f => {
        if (f.startsWith('.')) {
          fs.unlinkSync(path.join(dir, f));
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  try {
    // clean up generated files on current sketch
    cleanUpGeneratedFile(settings.getCurrentSketchPath());

    const newPath = path.join(
      settings.getBaseSketchesPath(),
      name);

    settings.setCurrentSketchPath(newPath);

    // clean up generated files on opened sketch
    cleanUpGeneratedFile(newPath);

    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export function listSketches(): string[] {
  return (fs.readdirSync(settings.getBaseSketchesPath()) as string[]);
}

export function copyIntoSketch(file: string): [true, string] | [false, null] {
  const fileName = path.basename(file);
  const destination = path.join(
    settings.getCurrentSketchPath(),
    fileName);
  try {
    fs.copyFileSync(file, destination);
    return [true, fileName];
  } catch (error) {
    alert(error);
    return [false, null];
  }
}
