import * as React from 'react';
import { useEffect, useState } from 'react';
import { useModal } from 'react-modal-hook';
import * as fs from '../lib/file-system';
import * as settings from '../lib/settings';
import { updateEditorContent } from './Editor';
import * as modals from './Modals';

require('../styles/files.less');

const { ipcRenderer } = window.require('electron');

export const Files = () => {
  const [files, setFiles] = useState([] as string[]);
  const [currentFile, setCurrentFile] = useState(settings.sketchMainFile);

  useEffect(() => {
    const files = fs.currentSketchFiles()
      .map(f => f.replace(/.*\//, ''))
      .sort((a, b) => {
        return a === settings.sketchMainFile
          ? - 1
          : b === settings.sketchMainFile
            ? 1
            : a.localeCompare(b);
      });

    setFiles(files);
  }, [currentFile]);

  useEffect(() => {
    ipcRenderer.on('new-file', showCreateFileModal);

    const nextFile = () => {
      for (let i = 0; i < files.length; i++) {
        if (files[i] === currentFile) {
          selectFile(files[i + 1] ? files[i + 1] : files[0]);
          break;
        }
      }
    };
    const previousFile = () => {
      for (let i = 0; i < files.length; i++) {
        if (files[i] === currentFile) {
          selectFile(files[i - 1] ? files[i - 1] : files[files.length - 1]);
          break;
        }
      }
    };

    ipcRenderer.on('next-file', nextFile);
    ipcRenderer.on('previous-file', previousFile);
    return () => {
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

  const [showEditFileModal, hideEditFileModal] = useModal(() =>
    modals.editFileModal(files, currentFile, hideEditFileModal, selectFile),
    [files, currentFile]);

  const showFileMenu = (f: string): void => {
    selectFile(f);
    showEditFileModal();
  };

  const [showCreateFileModal, hideCreateFileModal] = useModal(() =>
    modals.createFileModal(files, hideCreateFileModal, selectFile),
    [files, currentFile]);

  const containers = files.map(f => {
    const isMainFile = f === settings.sketchMainFile;
    const className = fs.currentOpenFile() === f ? 'active' : '';
    return <li key={f}>
      <span
        className={'fileName ' + className}
        onClick={_ => selectFile(f)}>{f}</span>
      {!isMainFile && <span className="menu"
        onClick={_ => showFileMenu(f)}>...</span>}
    </li>;
  });

  return <div className="files">
    <div className="container">
      <h1>Files<button onClick={_ => showCreateFileModal()}>+</button></h1>
      <ul>
        {containers}
      </ul>
    </div>
  </div>;
};
