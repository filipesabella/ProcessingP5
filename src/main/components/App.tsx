import * as React from 'react';
import { useEffect } from 'react';
import { useModal } from 'react-modal-hook';
import * as windows from '../lib/browser-window';
import * as settings from '../lib/settings';
import { initEditor } from './Editor';
import { Files } from './Files';
import { newSketchModal, openSketchModal, renameSketchModal } from './Modals';
import { openPreferencesDialog } from './PreferencesDialog';
import { openPreviewWindow } from './PreviewWindow';

const { ipcRenderer } = window.require('electron');

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

  const [showPreferencesModal, hidePreferencesModal] = useModal(() =>
    openPreferencesDialog(hidePreferencesModal), []);

  useEffect(() => {
    ipcRenderer.on('new-sketch', showNewSketchModal);
    ipcRenderer.on('rename-sketch', showRenameSketchModal);
    ipcRenderer.on('open-sketch', showOpenSketchModal);
    ipcRenderer.on('reload', () => windows.toPreview(w => w.reload()));

    ipcRenderer.on('toggle-dev-tools', () => {
      windows.toPreview(w => w.webContents.toggleDevTools());
    });

    ipcRenderer.on('open-preferences', showPreferencesModal);

    windows.toAll(w => w.setTitle(settings.getCurrentSketchName()));

    // remove me
    // showPreferencesModal();
  });

  return <div className="app">
    <Files />
  </div>;
};
