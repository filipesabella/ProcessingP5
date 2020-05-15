const remote = window.require('electron').remote;
const fs = remote.require('fs');

let currentSketchPath = '/home/filipe/ProcessingJS/sketch/';

export function currentSketchFiles(): string[] {
  return (fs.readdirSync(currentSketchPath) as string[])
    .filter(s => !s.startsWith('.'))
    .map(s => 'file://' + currentSketchPath + s);
}

export function writeCurrentFile(content: string): void {
  fs.writeFileSync(
    currentSketchPath + '/main.js',
    content);
}

export function readIndexTemplate(): string {
  const basePath = remote.app.getAppPath();
  const path = `${basePath}/assets/index.html`;

  return fs.readFileSync(path).toString();
}

export function p5Path(): string {
  const basePath = remote.app.getAppPath();

  return `file://${basePath}/assets/p5.js`;
}
