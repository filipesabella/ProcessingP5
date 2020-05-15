import * as React from 'react';
import { useEffect } from 'react';
import { initEditor } from './Editor';
import { openPreviewWindow } from './PreviewWindow';

require('../styles/app.less');

export const App = () => {
  useEffect(() => {
    initEditor();
    openPreviewWindow();
  });

  return <div className='app'></div>;
};
