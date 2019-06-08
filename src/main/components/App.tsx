import * as React from 'react';

import '../styles/app.less';

interface State {
}

export class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
  }

  public render(): React.ReactNode {
    return <div className="app">
      asd
    </div>;
  }
}
