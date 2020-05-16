import * as React from 'react';
import { FormEvent, useState } from 'react';
import * as windows from '../lib/browser-window';
import * as fs from '../lib/file-system';
import * as settings from '../lib/settings';
import { reloadFiles } from './PreviewWindow';

const remote = window.require('electron').remote;

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
    if (fs.renameSketchFile(currentFile, fileName)) {
      selectFile(fileName);
      reloadFiles();
      hideModal();
    }
    e.preventDefault();
  };

  const [deleteButtonLabel, setDeleteButtonLabel] = useState('Delete');
  const doDelete = () => {
    if (deleteButtonLabel === 'Delete') {
      setDeleteButtonLabel('Click to confirm deletion');
    } else {
      if (fs.deleteSketchFile(currentFile)) {
        selectFile(settings.sketchMainFile);
        reloadFiles();
        hideModal();
      }
    }
  };

  return <div className="modal fileModal">
    <div className="container">
      <h1>Rename or Delete {fileName}</h1>
      <form className="rename" onSubmit={renameFile}>
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
    if (fs.createSketchFile(fileName)) {
      selectFile(fileName);
      hideModal();
    }
    e.preventDefault();
  };

  return <div className="modal fileModal">
    <div className="container">
      <h1>Create a New File</h1>
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

export function newSketchModal(
  hideModal: () => void,
): JSX.Element {
  const createNewSketch = (e: FormEvent<HTMLFormElement>) => {
    if (fs.createNewSketch(sketchName)) {
      reloadAll();
    }
    e.preventDefault();
  };

  const [sketchName, setKetchName] = useState('');

  return <div className="modal sketchModal">
    <div className="container">
      <h1>Create a New Sketch</h1>
      <form className="name" onSubmit={createNewSketch}>
        <label>Name</label>
        <input type="text"
          autoFocus
          required={true}
          value={sketchName}
          onChange={e => setKetchName(e.target.value)}></input>
        <button>Save</button>
      </form>
      <label
        className="closeButton"
        onClick={_ => hideModal()}>X</label>
    </div>
    <div className="overlay" onClick={_ => hideModal()}></div>
  </div>;
}

export function renameSketchModal(
  hideModal: () => void,
): JSX.Element {
  const renameSketch = (e: FormEvent<HTMLFormElement>) => {
    if (fs.renameSketch(sketchName)) {
      reloadAll();
    }

    e.preventDefault();
  };

  const [sketchName, setKetchName] = useState(settings.getCurrentSketchName());

  return <div className="modal sketchModal">
    <div className="container">
      <h1>Rename Sketch</h1>
      <form className="name" onSubmit={renameSketch}>
        <label>Name</label>
        <input type="text"
          autoFocus
          required={true}
          value={sketchName}
          onChange={e => setKetchName(e.target.value)}></input>
        <button>Save</button>
      </form>
      <label
        className="closeButton"
        onClick={_ => hideModal()}>X</label>
    </div>
    <div className="overlay" onClick={_ => hideModal()}></div>
  </div>;
}

export function openSketchModal(
  hideModal: () => void,
): JSX.Element {
  const openSketch = (name: string) => {
    if (fs.openSketch(name)) {
      reloadAll();
    }
  };

  const sketchContainers = fs.listSketches()
    .filter(s => !settings.getCurrentSketchPath().endsWith(s))
    .map(s => {
      return <li key={s}
        onClick={_ => openSketch(s)}>{s}</li>;
    });

  return <div className="modal openSketchModal">
    <div className="container">
      <h1>Open a sketch</h1>
      <ul>{sketchContainers}</ul>
      <label
        className="closeButton"
        onClick={_ => hideModal()}>X</label>
    </div>
    <div className="overlay" onClick={_ => hideModal()}></div>
  </div>;
}

function reloadAll(): void {
  windows.toAll(w => w.reload());
}
