import { BrowserWindow } from 'electron';

const { remote } = window.require('electron');

export function toPreview(fn: (w: BrowserWindow) => void): void {
  all().filter(isNotMainWindow).forEach(fn);
}

export function toMain(fn: (w: BrowserWindow) => void): void {
  fn(main());
}

export function toAll(fn: (w: BrowserWindow) => void): void {
  all().forEach(fn);
}

export function main(): BrowserWindow {
  return all().filter(isMainWindow)[0];
}

function all(): BrowserWindow[] {
  return remote.BrowserWindow
    .getAllWindows() as BrowserWindow[];
}

function isMainWindow(w: BrowserWindow): boolean {
  // awful but the only way. id = 1 is the main window, always
  return w.id === 1;
}

function isNotMainWindow(w: BrowserWindow): boolean {
  return !isMainWindow(w);
}
