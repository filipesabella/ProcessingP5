import * as React from 'react';
import { useEffect, useState } from 'react';
import { currentOpenFile, currentSketchFiles, readSketchFile, sketchMainFile } from '../lib/file-system';
import { updateEditorContent } from './Editor';

const FileTree = require('react-filetree-electron');

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

  const containers = files.map(f => {
    const className = currentOpenFile() === f ? 'active' : '';
    return <li key={f}
      className={className}
      onClick={_ => selectFile(f)}>{f}</li>;
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
