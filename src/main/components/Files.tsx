import * as React from 'react';
import { useEffect, useState } from 'react';
import { useModal } from 'react-modal-hook';
import * as windows from '../lib/browser-window';
import * as fs from '../lib/file-system';
import * as settings from '../lib/settings';
import * as sketch from '../lib/sketch';
import { updateEditorContent } from './Editor';
import * as modals from './Modals';

const { dialog } = window.require('electron').remote;

require('../styles/files.less');

const { ipcRenderer } = window.require('electron');

export const Files = () => {
  const [files, setFiles] = useState([] as string[]);
  const [currentFile, setCurrentFile] = useState(settings.sketchMainFile);
  const [currentFileToEdit, setCurrentFileToEdit] =
    useState(settings.sketchMainFile);

  useEffect(() => {
    const files = fs.currentSketchFileNames()
      .sort((a, b) =>
        a === settings.sketchMainFile
          ? -1
          : b === settings.sketchMainFile
            ? 1
            : a.localeCompare(b));

    setFiles(files);
  }, [currentFile, currentFileToEdit]);

  const showImportFile = () => {
    const result = dialog.showOpenDialogSync(windows.main(), {
      title: 'Choose a file to import into the sketch',
      properties: ['openFile'],
    });

    if (result) {
      const [success, fileName] = fs.copyIntoSketch(result[0]);
      if (success) {
        setFiles(f => f.concat(fileName!));
      }
    }
  };

  useEffect(() => {
    ipcRenderer.on('import-file', showImportFile);
    ipcRenderer.on('new-file', showCreateFileModal);

    const scripts = files.filter(sketch.isScriptFile);

    const nextFile = () => {
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i] === currentFile) {
          selectFile(scripts[i + 1] ? scripts[i + 1] : scripts[0]);
          break;
        }
      }
    };
    const previousFile = () => {
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i] === currentFile) {
          selectFile(
            scripts[i - 1] ? scripts[i - 1] : scripts[scripts.length - 1],
          );
          break;
        }
      }
    };

    ipcRenderer.on('next-file', nextFile);
    ipcRenderer.on('previous-file', previousFile);

    return () => {
      ipcRenderer.removeListener('import-file', showImportFile);
      ipcRenderer.removeListener('new-file', showCreateFileModal);
      ipcRenderer.removeListener('next-file', nextFile);
      ipcRenderer.removeListener('previous-file', previousFile);
    };
  }, [files]);

  const selectFile = (f: string): void => {
    const content = fs.readSketchFile(f);
    updateEditorContent(content);
    setCurrentFile(f);
  };

  const [showEditFileModal, hideEditFileModal] = useModal(
    () =>
      modals.editFileModal(
        files,
        currentFileToEdit,
        hideEditFileModal,
        setCurrentFileToEdit),
    [files, currentFileToEdit],
  );

  const showFileMenu = (f: string): void => {
    setCurrentFileToEdit(f);
    showEditFileModal();
  };

  const [showCreateFileModal, hideCreateFileModal] = useModal(
    () => modals.createFileModal(files, hideCreateFileModal, selectFile),
    [files, currentFile],
  );

  const scriptsContainers = files
    .filter(sketch.isScriptFile)
    .map((f) => {
      const isMainFile = f === settings.sketchMainFile;
      const className = fs.currentOpenFile() === f ? 'active' : '';
      return <li key={f} className="file">
        <span
          className={'fileName ' + className}
          onClick={(_) => selectFile(f)}>
          {f}
        </span>
        {!isMainFile &&
          <span className="menu"
            onClick={(_) => showFileMenu(f)}>...</span>}
      </li>;
    });

  const otherFilesContainers = files
    .filter((f) =>
      f !== fs.indexFile &&
      !f.startsWith('.') &&
      !sketch.isScriptFile(f)
    )
    .map((f) => {
      return <li key={f}>
        <span className="fileName">{f}</span>
        <span className="menu"
          onClick={(_) => showFileMenu(f)}>...</span>
      </li>;
    });

  return <div className="files">
    <div className="container">
      <h1>Files</h1>
      <ul>
        {scriptsContainers}
      </ul>
      {otherFilesContainers.length > 0 && <h2>Other files</h2>}
      <ul>
        {otherFilesContainers}
      </ul>
    </div>
  </div>;
};
