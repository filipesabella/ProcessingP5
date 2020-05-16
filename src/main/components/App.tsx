import { BrowserWindow } from 'electron';
import * as React from 'react';
import { useEffect } from 'react';
import { useModal } from 'react-modal-hook';
import * as settings from '../lib/settings';
import { initEditor } from './Editor';
import { Files } from './Files';
import { newSketchModal, openSketchModal, renameSketchModal } from './Modals';
import { openPreviewWindow } from './PreviewWindow';

const { remote, ipcRenderer } = window.require('electron');

require('../styles/app.less');
require('../styles/modals.less');

export const App = () => {
  useEffect(() => {
    initEditor();
    openPreviewWindow();
  });

  const [showNewSketchModal, hideNewSketchModal] = useModal(() =>
    newSketchModal(hideNewSketchModal), []);

  const [showRenameSketchModal, hideRenameSketchModal] = useModal(() =>
    renameSketchModal(hideRenameSketchModal), []);

  const [showOpenSketchModal, hideOpenSketchModal] = useModal(() =>
    openSketchModal(hideOpenSketchModal), []);

  useEffect(() => {
    ipcRenderer.on('new-sketch', showNewSketchModal);
    ipcRenderer.on('rename-sketch', showRenameSketchModal);
    ipcRenderer.on('open-sketch', showOpenSketchModal);

    ipcRenderer.on('toggle-dev-tools', () => {
      (remote.BrowserWindow
        .getAllWindows() as BrowserWindow[])
        .forEach(w => {
          // awful but the only way. id = 1 is the main window, always
          w.id !== 1 && w.webContents.toggleDevTools();
        });
    });

    (remote.BrowserWindow
      .getAllWindows() as BrowserWindow[])
      .forEach(w => w.setTitle(settings.getCurrentSketchName()));
  });

  return <div className="app">
    <Files />
  </div>;
};
