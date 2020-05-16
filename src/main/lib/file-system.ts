import * as settings from './settings';

const remote = window.require('electron').remote;
const fs = remote.require('fs');
const path = remote.require('path');

const currentSketchPath = () => settings.getCurrentSketchPath();

let currentFile = settings.sketchMainFile;

export function currentSketchFiles(): string[] {
  return (fs.readdirSync(currentSketchPath()) as string[])
    .filter(s => !s.startsWith('.'))
    .map(s => path.join(currentSketchPath(), s));
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
    fs.unlinkSync(path.join(currentSketchPath(), f));
    return true;
  } catch (err) {
    alert(err);
    return false;
  }
}

export function renameSketchFile(orignalName: string, newName: string): boolean {
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

const defaultSketchContent = `function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  rect(10, 10, 100, 100);
}
`;

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
