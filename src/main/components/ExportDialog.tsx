import * as windows from '../lib/browser-window';
import * as fs from '../lib/file-system';

const { dialog } = window.require('electron').remote;

export const openExportSketchDialog = () => {
  const result = dialog.showOpenDialogSync(windows.main(), {
    title: 'Choose a directory to export to',
    properties: ['openDirectory'],
    createDirectory: true,
  });

  if (result) {
    fs.exportSketch(result[0]);
  }
};
