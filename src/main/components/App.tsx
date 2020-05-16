import * as React from 'react';
import { useEffect } from 'react';
import { useModal } from 'react-modal-hook';
import { initEditor } from './Editor';
import { Files } from './Files';
import { newSketchModal, openSketchModal, renameSketchModal } from './Modals';
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

  const [showRenameSketchModal, hideRenameSketchModal] = useModal(() =>
    renameSketchModal(hideRenameSketchModal), []);
  useEffect(() => {
    ipcRenderer.on('rename-sketch', showRenameSketchModal);
  });

  const [showOpenSketchModal, hideOpenSketchModal] = useModal(() =>
    openSketchModal(hideOpenSketchModal), []);
  useEffect(() => {
    ipcRenderer.on('open-sketch', showOpenSketchModal);
  });

  return <div className="app">
    <Files />
  </div>;
};
