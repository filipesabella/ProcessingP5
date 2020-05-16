import * as React from 'react';
import { useEffect, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { currentOpenFile, currentSketchFiles, readSketchFile, sketchMainFile } from '../lib/file-system';
import { updateEditorContent } from './Editor';
import { createFileModal, editFileModal } from './Modals';

export const Files = () => {
  const [files, setFiles] = useState([] as string[]);
  const [currentFile, setCurrentFile] = useState(sketchMainFile);

  useEffect(() => {
    const files = currentSketchFiles()
      .map(f => f.replace(/.*\//, ''))
      .sort((a, b) => {
        return a === sketchMainFile
          ? - 1
          : b === sketchMainFile
            ? 1
            : a.localeCompare(b);
      });

    setFiles(files);
  }, [currentFile]);

  const selectFile = (f: string): void => {
    const content = readSketchFile(f);
    updateEditorContent(content);
    setCurrentFile(f);
  };

  const [showEditFileModal, hideEditFileModal] = useModal(() =>
    editFileModal(files, currentFile, hideEditFileModal, selectFile),
    [files, currentFile]);

  const showFileMenu = (f: string): void => {
    selectFile(f);
    showEditFileModal();
  };

  const [showCreateFilModal, hideCreateFilModal] = useModal(() =>
    createFileModal(files, hideCreateFilModal, selectFile),
    [files, currentFile]);

  const containers = files.map(f => {
    const isMainFile = f === sketchMainFile;
    const className = currentOpenFile() === f ? 'active' : '';
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
