import * as React from 'react';
import { useEffect } from 'react';
import { initEditor } from './Editor';

require('../styles/app.less');

export const App = () => {
  useEffect(() => {
    initEditor();
  });

  return <div className='app'></div>;
};
