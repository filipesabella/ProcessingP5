import * as React from 'react';
import { useEffect } from 'react';
import { useModal } from 'react-modal-hook';
import * as windows from '../lib/browser-window';
import * as fs from '../lib/file-system';
import * as settings from '../lib/settings';
import { initEditor } from './Editor';
import { openExportSketchDialog } from './ExportDialog';
import { Files } from './Files';
import { newSketchModal, openSketchModal, renameSketchModal } from './Modals';
import { changeDarkMode, openPreferencesDialog } from './PreferencesDialog';
import * as previewWindow from './PreviewWindow';

const { ipcRenderer, shell, } = window.require('electron');

require('../styles/app.less');
require('../styles/modals.less');

export const App = () => {
  useEffect(() => {
    try {
      fs.openSketch(settings.getCurrentSketchName());
      previewWindow.reloadFiles();

      initEditor();
      previewWindow.openPreviewWindow();
    } catch (e) {
      console.error(e);
    }
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
    ipcRenderer.on('reload', previewWindow.reloadPreviewWindow);

    ipcRenderer.on('toggle-dev-tools', () => {
      windows.toPreview(w => {
        w.webContents.toggleDevTools();
        windows.toPreview(w => w.reload());
      });
    });

    if (process.env.DEV_MODE === 'true') {
      windows.toMain(w => w.webContents.openDevTools());
      windows.toPreview(w => w.webContents.toggleDevTools());
    }

    ipcRenderer.on('auto-hide-menu-bar', () => {
      windows.toMain(w => w.autoHideMenuBar = true);
    });

    ipcRenderer.on('export-sketch', openExportSketchDialog);

    ipcRenderer.on('open-preferences', showPreferencesModal);

    ipcRenderer.on('auto-arrange-windows', windows.autoArrange);

    ipcRenderer.on('open-sketch-directory',
      () => shell.openItem(settings.getCurrentSketchPath()));

    ipcRenderer.on('toggle-sidebar', () =>
      toggleSidebar(!settings.getSidebarOpen()));
    toggleSidebar(settings.getSidebarOpen());

    const sketchName = settings.getCurrentSketchName();
    windows.toMain(w => w.setTitle('Code - ' + sketchName));

    changeDarkMode(settings.getDarkMode());

    // behold, the ugliest hack in the app. didn't want to bind
    // the escape key to all 6 modals to close them, so we force
    // a click on the 'overlay' div to trigger the hiding
    document.onkeyup = e => {
      if (e.which === 27) {
        const modalOverlay = document.querySelector<HTMLDivElement>('.overlay');
        modalOverlay && modalOverlay.click();
      }
    };
  }, []);

  return <Files />;
};

function toggleSidebar(open: boolean): void {
  const s = getComputedStyle(document.body);
  const width = s.getPropertyValue('--sidebar-width').trim();
  document.body.style.setProperty('--sidebar-width-current',
    open ? width : '0em');

  settings.setSidebarOpen(open);
}
