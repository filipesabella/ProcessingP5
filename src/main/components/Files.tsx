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
    const files = fs.currentSketchFileNames()
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

    const scripts = files.filter(f => f.endsWith('.js'));

    const nextFile = () => {
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i] === currentFile) {
          selectFile(scripts[i + 1]
            ? scripts[i + 1]
            : scripts[0]);
          break;
        }
      }
    };
    const previousFile = () => {
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i] === currentFile) {
          selectFile(scripts[i - 1]
            ? scripts[i - 1]
            : scripts[scripts.length - 1]);
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

  const scriptsContainers = files
    .filter(f => f.endsWith('.js'))
    .map(f => {
      const isMainFile = f === settings.sketchMainFile;
      const className = fs.currentOpenFile() === f ? 'active' : '';
      return <li key={f} className="file">
        <span
          className={'fileName ' + className}
          onClick={_ => selectFile(f)}>{f}</span>
        {!isMainFile && <span className="menu"
          onClick={_ => showFileMenu(f)}>...</span>}
      </li>;
    });

  const otherFilesContainers = files
    .filter(f => f !== 'index.html' && !f.endsWith('.js'))
    .map(f => {
      return <li key={f}>
        <span>{f}</span>
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
