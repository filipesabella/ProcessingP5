import * as React from 'react';
import { useEffect } from 'react';
import { initEditor } from './Editor';
import { openPreviewWindow } from './PreviewWindow';
const { remote, ipcRenderer } = (window as any).require('electron');

require('../styles/app.less');

export const App = () => {
  useEffect(() => {
    initEditor();
    openPreviewWindow();
  });

  return <div className='app'></div>;
};

ipcRenderer.on('new-sketch', () => console.log('new sketch'));
ipcRenderer.on('save-sketch-as', () => console.log('save sketch as'));
ipcRenderer.on('open-sketch', () => console.log('open sketch'));
