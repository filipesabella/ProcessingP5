import * as monaco from 'monaco-editor';
import * as React from 'react';
import { ChangeEvent, useState } from 'react';
import * as windows from '../lib/browser-window';
import * as settings from '../lib/settings';
import * as sketch from '../lib/sketch';

require('../styles/preferences-dialog.less');

const { dialog } = window.require('electron').remote;

export const openPreferencesDialog = (hideModal: () => void) => {
  const [sketchesDirectory, setSketchesDirectory] =
    useState(settings.getBaseSketchesPath());

  const changeSketchesDirectory = () => {
    const newDirectory = directoryChooser(sketchesDirectory);
    if (newDirectory) {
      setSketchesDirectory(newDirectory);
    }
  };

  const save = () => {
    settings.setBaseSketchesPath(sketchesDirectory);

    // force the app to either find a new one in the new directory
    // or create an empty sketch
    settings.setCurrentSketchPath('');

    windows.toAll(w => w.reload());
  };

  const [darkMode, setDarkMode] = useState(settings.getDarkMode());
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    changeDarkMode(!darkMode);
  };

  const [showLineNumbers, setShowLineNumbers] =
    useState(settings.getShowLineNumbers());
  const toggleShowLineNumbers = () => {
    setShowLineNumbers(!showLineNumbers);
    settings.setShowLineNumbers(!showLineNumbers);
  };

  const [runMode, setRunMode] = useState(settings.getRunMode());
  const changeRunMode = (e: ChangeEvent<HTMLSelectElement>) => {
    const mode = e.target.value as settings.RunModes;
    setRunMode(mode);
    settings.setRunMode(mode);
  };

  const [hotCodeReload, setHotCodeReload] =
    useState(settings.getHotCodeReload());
  const toggleHotCodeReload = () => {
    setHotCodeReload(!hotCodeReload);
    settings.setHotCodeReload(!hotCodeReload);
    sketch.buildIndexHtml();
    windows.toPreview(w => w.reload());
  };

  const [showAdvancedSection, setShowAdvancedSection]
    = useState(false);

  return <div className="modal preferencesModal">
    <div className="container">
      <h1>Preferences</h1>
      <div className="field darkMode">
        <label>Dark Mode</label>
        <input type="checkbox"
          checked={darkMode}
          onChange={_ => toggleDarkMode()}></input>
      </div>
      <div className="field showLineNumbers">
        <label>Show Line Numbers</label>
        <input type="checkbox"
          checked={showLineNumbers}
          onChange={_ => toggleShowLineNumbers()}></input>
      </div>
      <div className="field directory">
        <label>When to run the sketch</label>
        <select value={runMode} onChange={changeRunMode}>
          <option value="manual">Only when I press ctrl+r</option>
          <option value="keystroke">On every keystroke</option>
        </select>
      </div>

      <h2
        onClick={_ => setShowAdvancedSection(!showAdvancedSection)}>
        <span>{'Advanced ' + (showAdvancedSection ? '▲' : '▼')}</span>
      </h2>
      {showAdvancedSection && <div className="field">
        <label>Hot Code Reload</label>
        <input type="checkbox"
          checked={hotCodeReload}
          onChange={_ => toggleHotCodeReload()}></input>
        <label className="warning">(works most of the time)</label>
      </div>}

      {showAdvancedSection && <div className="field directory">
        <label>Sketches directory</label>
        <input
          readOnly={true}
          value={sketchesDirectory}
          onClick={_ => changeSketchesDirectory()}></input>
      </div>}
      {showAdvancedSection &&
        sketchesDirectory !== settings.getBaseSketchesPath() &&
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
