import * as React from 'react';
import { useEffect } from 'react';
import { initEditor } from './Editor';
import { Files } from './Files';
import { openPreviewWindow } from './PreviewWindow';
const { ipcRenderer } = (window as any).require('electron');

require('../styles/app.less');
require('../styles/modals.less');

export const App = () => {
  useEffect(() => {
    initEditor();
    openPreviewWindow();
  });

  return <div className="app">
    <Files />
  </div>;
};

ipcRenderer.on('new-sketch', () => console.log('new sketch'));
ipcRenderer.on('save-sketch-as', () => console.log('save sketch as'));
ipcRenderer.on('open-sketch', () => console.log('open sketch'));
