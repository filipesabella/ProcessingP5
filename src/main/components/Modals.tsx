import * as React from 'react';
import { FormEvent, useState } from 'react';
import { createSketchFile, deleteSketchFile, renameSketchFile, sketchMainFile } from '../lib/file-system';

export function editFileModal(
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


export function createFileModal(
  files: string[],
  hideModal: () => void,
  selectFile: (s: string) => void,
): JSX.Element {
  const existingFiles = files.join('|');
  const validationPattern = `^(?!(${existingFiles})).*(\.js)$`;
  const [fileName, setFileName] = useState('');
  const createFile = (e: FormEvent<HTMLFormElement>) => {
    if (createSketchFile(fileName)) {
      selectFile(fileName);
      hideModal();
    }
    e.preventDefault();
  };

  return <div className="fileModal">
    <div className="container">
      <form className="name" onSubmit={createFile}>
        <label>Name</label>
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
    </div>
    <div className="overlay" onClick={_ => hideModal()}></div>
  </div>;
}
