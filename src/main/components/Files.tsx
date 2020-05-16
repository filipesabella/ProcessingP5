import * as React from 'react';
import { FormEvent, useEffect, useState } from 'react';
import { useModal } from 'react-modal-hook';
import { currentOpenFile, currentSketchFiles, deleteSketchFile, readSketchFile, renameSketchFile, sketchMainFile } from '../lib/file-system';
import { updateEditorContent } from './Editor';

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

  const [showModal, hideModal] = useModal(() =>
    fileModal(files, currentFile, hideModal, selectFile), [files]);

  const showFileMenu = (f: string): void => {
    selectFile(f);
    window.setTimeout(showModal, 100);
  };

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
      <h1>Files</h1>
      <ul>
        {containers}
      </ul>
    </div>
  </div>;
};

function fileModal(
  files: string[],
  currentFile: string,
  hideModal: () => void,
  selectFile: (s: string) => void,
): JSX.Element {
  const existingFiles = files.filter(f => f !== currentFile).join('|');
  const validationPattern = `^(?!(${existingFiles})).*(\.js)$`;
  const [fileName, setFileName] = useState(currentFile);
  const renameFile = (e: FormEvent<HTMLFormElement>) => {
    if (renameSketchFile(currentFile, fileName)) {
      selectFile(fileName);
      hideModal();
    }
    e.preventDefault();
  };

  const [deleteButtonLabel, setDeleteButtonLabel] = useState('Delete');
  const doDelete = () => {
    if (deleteButtonLabel === 'Delete') {
      setDeleteButtonLabel('Click to confirm deletion');
    } else {
      if (deleteSketchFile(currentFile)) {
        selectFile(sketchMainFile);
        hideModal();
      }
    }
  };

  return <div className="fileModal">
    <div className="container">
      <form className="rename" onSubmit={renameFile}>
        <label>Rename</label>
        <input type="text"
          required={true}
          pattern={validationPattern}
          value={fileName}
          onChange={e => setFileName(e.target.value)}
          title="Must not have the same name as another file, and must end with .js"></input>
        <button>Save</button>
      </form>
      <label
        className="closeButton"
        onClick={_ => hideModal()}>X</label>
      <button
        className="delete"
        onClick={_ => doDelete()}>{deleteButtonLabel}</button>
    </div>
    <div className="overlay" onClick={_ => hideModal()}></div>
  </div>;
}
