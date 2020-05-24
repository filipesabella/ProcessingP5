// from https://github.com/mawie81/electron-window-state/blob/master/index.js

let fs, path, electron, platform;

try { // running in renderer process
  const r = window.require;
  electron = r('electron');
  const remote = electron.remote;
  fs = remote.require('fs');
  path = remote.require('path');
  platform = remote.getGlobal('process').platform;
} catch (e) { // running in main process
  electron = require('electron');
  fs = require('fs');
  path = require('path');
  platform = process.platform;
}

module.exports = function(options) {
  const app = electron.app || electron.remote.app;
  const screen = electron.screen || electron.remote.screen;
  let state;
  let winRef;
  let stateChangeTimer;
  const eventHandlingDelay = 100;
  const config = Object.assign({
    file: 'window-state.json',
    path: app.getPath('userData'),
    maximize: true,
  }, options);
  const fullStoreFileName = path.join(config.path, config.file);

  function isNormal(win) {
    return !win.isMaximized() && !win.isMinimized();
  }

  function hasBounds() {
    return state &&
      Number.isInteger(state.x) &&
      Number.isInteger(state.y) &&
      Number.isInteger(state.width) && state.width > 0 &&
      Number.isInteger(state.height) && state.height > 0;
  }

  function resetStateToDefault() {
    const displayBounds = screen.getPrimaryDisplay().bounds;

    // Reset state to default values on the primary display
    state = {
      width: config.defaultWidth || 800,
      height: config.defaultHeight || 600,
      x: 0,
      y: 0,
      displayBounds
    };
  }

  function windowWithinBounds(bounds) {
    return (
      state.x >= bounds.x &&
      state.y >= bounds.y &&
      state.x + state.width <= bounds.x + bounds.width &&
      state.y + state.height <= bounds.y + bounds.height
    );
  }

  function ensureWindowVisibleOnSomeDisplay() {
    const visible = screen.getAllDisplays().some(display => {
      return windowWithinBounds(display.bounds);
    });

    if (!visible) {
      // Window is partially or fully not visible now.
      // Reset it to safe defaults.
      return resetStateToDefault();
    }
  }

  function validateState() {
    const isValid = state && (hasBounds() || state.isMaximized);
    if (!isValid) {
      state = null;
      return;
    }

    if (hasBounds() && state.displayBounds) {
      ensureWindowVisibleOnSomeDisplay();
    }
  }

  function updateState(win) {
    win = win || winRef;
    if (!win) {
      return;
    }

    // Don't throw an error when window was closed
    try {
      const winBounds = win.getBounds();
      if (isNormal(win)) {
        state.x = winBounds.x;
        state.y = winBounds.y;
        state.width = winBounds.width;
        state.height = winBounds.height;
      }
      state.isMaximized = win.isMaximized();
      state.displayBounds = screen.getDisplayMatching(winBounds).bounds;
    } catch (err) {
      console.error(err);
    }

    saveState();
  }

  function saveState() {
    try {
      fs.mkdirSync(path.dirname(fullStoreFileName), {
        recursive: true
      });
      fs.writeFileSync(fullStoreFileName, JSON.stringify(state));
    } catch (err) {
      console.error(err);
    }
  }

  function stateChangeHandler() {
    clearTimeout(stateChangeTimer);
    stateChangeTimer = setTimeout(updateState, eventHandlingDelay);
  }

  function manage(win) {
    if (config.maximize && state.isMaximized) {
      win.maximize();
    }
    win.on('resize', stateChangeHandler);
    win.on('move', stateChangeHandler);
    winRef = win;

    return win;
  }

  try {
    // to remove a parcel bundler warning
    const rfs = fs;

    if (rfs.existsSync(fullStoreFileName)) {
      state = JSON.parse(rfs.readFileSync(fullStoreFileName));
    } else {
      state = null;
    }
  } catch (err) {
    console.error(err);
  }

  validateState();

  // Set state fallback values
  state = Object.assign({
    width: config.defaultWidth || 800,
    height: config.defaultHeight || 600
  }, state);

  return {
    get x() {
      return state.x;
    },
    get y() {
      // https://github.com/electron/electron/issues/10388
      if (platform === 'linux') {
        return state.y - 30;
      } else {
        return state.y;
      }
    },
    get width() {
      return state.width;
    },
    get height() {
      return state.height;
    },
    manage,
  };
};
