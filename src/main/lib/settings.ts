const remote = window.require('electron').remote;
const settings = remote.require('electron-settings');
const path = remote.require('path');
const fs = remote.require('fs');
const app = remote.app;

const veryFirstSketchName = 'my-first-sketch/';
const defaultSketchesWorkspaceName = 'ProcessingP5/';

const defaultSketchContent = `function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  rect(10, 10, 100, 100);
}
`;

export function initSettings(): void {
  // settings.deleteAll();

  // first time opening the app
  if (!settings.has(keys.baseSketchesPath)) {
    const basePath = path
      .join(app.getPath('documents'), defaultSketchesWorkspaceName) as string;

    settings.set(keys.baseSketchesPath, basePath);

    const sketchPath = path.join(basePath + veryFirstSketchName);
    fs.mkdirSync(sketchPath, {
      recursive: true
    });
    fs.writeFileSync(path.join(sketchPath, 'main.js'), defaultSketchContent);

    settings.set(keys.currentSketchPath, sketchPath);
  }
}

export function getBaseSketchesPath(): string {
  return settings.get(keys.baseSketchesPath);
}

export function getCurrentSketchPath(): string {
  return settings.get(keys.currentSketchPath);
}

export function setCurrentSketchPath(newPath: string): void {
  settings.set(keys.currentSketchPath, newPath);
}

const keys = {
  baseSketchesPath: 'base-sketches-path',
  currentSketchPath: 'current-sketch-path',
};
