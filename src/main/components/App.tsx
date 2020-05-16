import * as React from 'react';
import { useEffect } from 'react';
import { useModal } from 'react-modal-hook';
import { initEditor } from './Editor';
import { Files } from './Files';
import { newSketchModal } from './Modals';
import { openPreviewWindow } from './PreviewWindow';
const { ipcRenderer } = (window as any).require('electron');

require('../styles/app.less');
require('../styles/modals.less');

export const App = () => {
  useEffect(() => {
    initEditor();
    openPreviewWindow();
  });

  const [showNewSketchModal, hideNewSketchModal] = useModal(() =>
    newSketchModal(hideNewSketchModal), []);

  useEffect(() => {
    ipcRenderer.on('new-sketch', showNewSketchModal);
  });

  return <div className="app">
    <Files />
  </div>;
};

ipcRenderer.on('save-sketch-as', () => console.log('save sketch as'));
ipcRenderer.on('open-sketch', () => console.log('open sketch'));
