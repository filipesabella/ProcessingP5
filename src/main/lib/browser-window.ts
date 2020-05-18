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

export function autoArrange(): void {
  const { width, height } = remote.screen.getPrimaryDisplay().workArea;
  const halfWidth = width / 2;
  toMain(w => w.setBounds({
    x: 0,
    y: 0,
    width: halfWidth,
    height: height,
  }));
  toPreview(w => w.setBounds({
    x: halfWidth,
    y: 0,
    width: halfWidth,
    height: height,
  }));
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
