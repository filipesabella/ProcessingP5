import * as React from 'react';
import { useEffect } from 'react';
import { useModal } from 'react-modal-hook';
import * as windows from '../lib/browser-window';
import * as fs from '../lib/file-system';
import * as settings from '../lib/settings';
import { initEditor } from './Editor';
import { Files } from './Files';
import { newSketchModal, openSketchModal, renameSketchModal } from './Modals';
import { changeDarkMode, openPreferencesDialog } from './PreferencesDialog';
import { openPreviewWindow, reloadPreviewWindow } from './PreviewWindow';

const { ipcRenderer } = window.require('electron');

require('../styles/app.less');
require('../styles/modals.less');

export const App = () => {
  useEffect(() => {
    initEditor();
    openPreviewWindow();
  }, []);

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
    ipcRenderer.on('reload', reloadPreviewWindow);

    ipcRenderer.on('toggle-dev-tools', () => {
      windows.toPreview(w => w.webContents.toggleDevTools());
    });

    ipcRenderer.on('auto-hide-menu-bar', () => {
      windows.toMain(w => w.autoHideMenuBar = true);
    });

    ipcRenderer.on('export-sketch', () => {
      fs.exportSketch();
    });

    ipcRenderer.on('open-preferences', showPreferencesModal);

    ipcRenderer.on('toggle-sidebar', () => {
      const s = getComputedStyle(document.body);
      const width = s.getPropertyValue('--sidebar-width').trim();
      const current = s.getPropertyValue('--sidebar-width-current').trim();
      document.body.style.setProperty('--sidebar-width-current',
        current === '0em' ? width : '0em');
    });

    windows.toAll(w => w.setTitle(settings.getCurrentSketchName()));

    changeDarkMode(settings.getDarkMode());
  }, []);

  return <Files />;
};
