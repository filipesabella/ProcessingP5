import * as React from 'react';
import { useEffect, useState } from 'react';
import { useModal } from 'react-modal-hook';
import * as fs from '../lib/file-system';
import { updateEditorContent } from './Editor';
import * as modals from './Modals';

require('../styles/files.less');

export const Files = () => {
  const [files, setFiles] = useState([] as string[]);
  const [currentFile, setCurrentFile] = useState(fs.sketchMainFile);

  useEffect(() => {
    const files = fs.currentSketchFiles()
      .map(f => f.replace(/.*\//, ''))
      .sort((a, b) => {
        return a === fs.sketchMainFile
          ? - 1
          : b === fs.sketchMainFile
            ? 1
            : a.localeCompare(b);
      });

    setFiles(files);
  }, [currentFile]);

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

  const [showCreateFilModal, hideCreateFilModal] = useModal(() =>
    modals.createFileModal(files, hideCreateFilModal, selectFile),
    [files, currentFile]);

  const containers = files.map(f => {
    const isMainFile = f === fs.sketchMainFile;
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
      <h1>Files<button onClick={_ => showCreateFilModal()}>+</button></h1>
      <ul>
        {containers}
      </ul>
    </div>
  </div>;
};
