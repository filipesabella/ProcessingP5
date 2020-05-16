import { BrowserWindow } from 'electron';

const { remote } = window.require('electron');

export function toPreview(fn: (w: BrowserWindow) => void): void {
  // awful but the only way. id = 1 is the main window, always
  all().forEach(w => w.id !== 1 && fn(w));
}

export function toAll(fn: (w: BrowserWindow) => void): void {
  all().forEach(fn);
}

export function main(): BrowserWindow[] {
  return all().filter(w => w.id === 1)[0];
}

export function all(): BrowserWindow[] {
  return remote.BrowserWindow
    .getAllWindows() as BrowserWindow[];
}
