import * as fileSystem from './file-system';

const remote = window.require('electron').remote;
const settings = remote.require('electron-settings');
const path = remote.require('path');
const fs = remote.require('fs');
const app = remote.app;

export const sketchMainFile = 'main.js';

const veryFirstSketchName = 'my-first-sketch/';
const defaultSketchesWorkspaceName = 'ProcessingP5/';

const keys = {
  baseSketchesPath: 'base-sketches-path',
  currentSketchPath: 'current-sketch-path',
  darkMode: 'dark-mode',
  showLineNumbers: 'show-line-numbers',
  runMode: 'run-mode',
  fontSize: 'font-size',
  hotCodeReload: 'hot-code-reload',
  sidebarOpen: 'sidebar-open',
  librariesPerSketch: 'libraries-per-sketck',
};

// oh my this is a hot mess
export function initSettings(): void {
  // useful for dev mode
  // settings.deleteAll();

  // first time opening the app
  if (!settings.has(keys.baseSketchesPath)) {
    const basePath = path
      .join(app.getPath('documents'), defaultSketchesWorkspaceName) as string;

    try {
      fs.mkdirSync(basePath, {
        recursive: true
      });
      settings.set(keys.baseSketchesPath, basePath);
    } catch (e) {
      // the configuration might have disappeared but the
      // directories still exist
      console.error(e);
    }
  }

  const currentSketch = getCurrentSketchPath();

  // the previously open sketch doesn't exist anymore
  if (!fs.existsSync(currentSketch)) {
    // make sure the directory exists
    fs.mkdirSync(getBaseSketchesPath(), {
      recursive: true
    });

    const sketches = fs.readdirSync(getBaseSketchesPath());

    // open the first available sketch
    if (sketches.length > 0) {
      setCurrentSketchPath(
        path.join(getBaseSketchesPath(), sketches[0]));
    } else {
      fileSystem.createNewSketch(veryFirstSketchName);
    }
  }
}

export function getBaseSketchesPath(): string {
  return settings.get(keys.baseSketchesPath);
}

export function getCurrentSketchPath(): string {
  return settings.get(keys.currentSketchPath);
}

export function getCurrentSketchName(): string {
  return path.basename(getCurrentSketchPath());
}

export function setCurrentSketchPath(newPath: string): void {
  settings.set(keys.currentSketchPath, newPath);
}

export function setBaseSketchesPath(newPath: string): void {
  settings.set(keys.baseSketchesPath, newPath);
}

export function getDarkMode(): boolean {
  return settings.get(keys.darkMode) ?? true;
}

export function setDarkMode(darkMode: boolean): void {
  settings.set(keys.darkMode, darkMode);
}

export type RunModes = 'keystroke' | 'manual';

export function getRunMode(): RunModes {
  return settings.get(keys.runMode) ?? 'manual';
}

export function setRunMode(runMode: RunModes): void {
  settings.set(keys.runMode, runMode);
}

export const defaultFontSize = 16;

export function getFontSize(): number {
  return settings.get(keys.fontSize) ?? defaultFontSize;
}

export function setFontSize(fontSize: number): void {
  settings.set(keys.fontSize, fontSize);
}

export function getShowLineNumbers(): boolean {
  return settings.get(keys.showLineNumbers) ?? false;
}

export function setShowLineNumbers(showLineNumbers: boolean): void {
  settings.set(keys.showLineNumbers, showLineNumbers);
}

export function watchShowLineNumbers(fn: (b: boolean) => void): void {
  settings.watch(keys.showLineNumbers, fn);
}

export function getHotCodeReload(): boolean {
  return settings.get(keys.hotCodeReload) ?? false;
}

export function setHotCodeReload(hotCodeReload: boolean): void {
  settings.set(keys.hotCodeReload, hotCodeReload);
}

export function getSidebarOpen(): boolean {
  return settings.get(keys.sidebarOpen) ?? false;
}

export function setSidebarOpen(sidebarOpen: boolean): void {
  settings.set(keys.sidebarOpen, sidebarOpen);
}

export function loadSketchLibraries(): string[] {
  const all = settings.get(keys.librariesPerSketch);
  return all ? all[getCurrentSketchName()] ?? [] : [];
}

export function updateSketchLibraries(
  fn: (libraries: string[]) => string[]): void {
  const sketch = getCurrentSketchName();
  const all = settings.get(keys.librariesPerSketch) ?? {};
  all[sketch] = fn(loadSketchLibraries());
  settings.set(keys.librariesPerSketch, all);
}

export function renameSketch(oldName: string, newName: string): void {
  const all = settings.get(keys.librariesPerSketch) ?? {};

  const renameProp = (
    oldProp: string,
    newProp: string,
    { [oldProp]: old, ...others }
  ) => {
    return {
      [newProp]: old,
      ...others
    };
  };
  if (all[oldName]) {
    settings.set(keys.librariesPerSketch, renameProp(oldName, newName, all));
  }
}
