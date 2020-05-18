import * as windows from '../lib/browser-window';
import * as sketch from '../lib/sketch';

const { dialog } = window.require('electron').remote;

export const openExportSketchDialog = () => {
  const result = dialog.showOpenDialogSync(windows.main(), {
    title: 'Choose a directory to export to',
    properties: ['openDirectory'],
    createDirectory: true,
  });

  if (result) {
    sketch.exportSketch(result[0]);
  }
};
