import * as monaco from 'monaco-editor';
import * as React from 'react';
import { useState } from 'react';
import * as windows from '../lib/browser-window';
import * as fs from '../lib/file-system';
import * as settings from '../lib/settings';

const { dialog } = window.require('electron').remote;

export const openPreferencesDialog = (hideModal: () => void) => {
  const [sketchesDirectory, setSketchesDirectory] =
    useState(settings.getBaseSketchesPath());

  const changeSketchesDirectory = () => {
    console.log(sketchesDirectory);
    const newDirectory = directoryChooser(sketchesDirectory);
    if (newDirectory) {
      setSketchesDirectory(newDirectory);
    }
  };

  const save = () => {
    const changedSketchesDirectory =
      sketchesDirectory !== settings.getBaseSketchesPath();

    if (changedSketchesDirectory) {
      const confirmed = dialog.showMessageBoxSync({
        type: 'question',
        title: 'Moving Sketches Directory',
        message: 'You have changed the sketches directory. All current ' +
          'sketches will be moved to that new location.',
        buttons: ['Ok', 'Cancel'],
      }) === 0;
      if (confirmed) {
        if (fs.changeBaseSketchesPath(sketchesDirectory)) {
          settings.setBaseSketchesPath(sketchesDirectory);
          windows.toAll(w => w.reload());
        }
      }
    }
  };

  const [darkMode, setDarkMode] = useState(settings.getDarkMode());
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    changeDarkMode(!darkMode);
  };

  return <div className="modal preferencesModal">
    <div className="container">
      <h1>Preferences</h1>
      <div className="darkMode">
        <label>Dark Mode</label>
        <input type="checkbox"
          checked={darkMode}
          onChange={_ => toggleDarkMode()}></input>
      </div>
      <div className="directory">
        <label>Sketches directory</label>
        <input
          readOnly={true}
          value={sketchesDirectory}
          onClick={_ => changeSketchesDirectory()}></input>
      </div>
      {sketchesDirectory !== settings.getBaseSketchesPath() &&
        <div className="buttonContainer">
          <button onClick={_ => save()}>Save</button>
        </div>}
      <label
        className="closeButton"
        onClick={_ => hideModal()}>X</label>
    </div>
    <div className="overlay" onClick={_ => hideModal()}></div>
  </div>;
};

function directoryChooser(currentDirectory: string): string | undefined {
  const result = dialog.showOpenDialogSync(windows.main(), {
    properties: ['openDirectory'],
    defaultPath: currentDirectory,
    createDirectory: true,
  });

  return result ? result[0] : undefined;
}

export function changeDarkMode(darkMode: boolean): void {
  settings.setDarkMode(darkMode);
  monaco.editor.setTheme(darkMode ? 'vs-dark' : 'vs-light');

  const toRemove = darkMode ? 'light' : 'dark';
  const toAdd = darkMode ? 'dark' : 'light';
  document.body.classList.remove(toRemove);
  document.body.classList.add(toAdd);
}
