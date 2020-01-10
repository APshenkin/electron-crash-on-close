import path from 'path';
import url from 'url';
import fs from 'fs';
import { app, BrowserWindow, Menu, ipcMain, crashReporter } from 'electron';
import {dashboardSize} from './constants';

let isDevelopment = (process.env.NODE_ENV === 'development');

crashReporter.start({
  companyName: 'test',
  submitURL: 'nevermid',
  uploadToServer: false
})

let mainWindow = null;

let forceQuit = false;

const installExtensions = async() => {
  const installer = require('electron-devtools-installer');
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

  for (const name of extensions) {
    try {
      await installer.default(installer[name], forceDownload);
    } catch (e) {
      console.info(`Error installing ${name} extension: ${e.message}`);
    }
  }
};

app.name = 'test';

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Disable zoom
app.commandLine.appendSwitch('disable-pinch');

const gotTheLock = app.requestSingleInstanceLock();
const windows = {};

if (!gotTheLock) {
  app.quit();
} else {
  app.on('ready', async() => {
    if (isDevelopment) {
      await installExtensions();
    }


    const initialWidth = dashboardSize.width;
    const initialHeight = dashboardSize.height;

    mainWindow = new BrowserWindow({
      width: initialWidth,
      height: initialHeight,
      minWidth: initialWidth,
      minHeight: initialHeight,
      fullscreenable: false,
      maximizable: false,
      show: false,
      titleBarStyle: 'hidden',
      resizable: process.env.NODE_ENV === 'development',
      webPreferences: {
        nativeWindowOpen: true,
        nodeIntegration: true
      },
      transparent: true,
      useContentSize: true,
    });

    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }));

    // show window once on first load
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.show();
    });

    mainWindow.webContents.on('did-finish-load', () => {
      // Handle window logic properly on macOS:
      // 1. App should not terminate if window has been closed
      // 2. Click on icon in dock should re-open the window
      // 3. ⌘+Q should close the window and quit the app
      if (process.platform === 'darwin') {
        mainWindow.on('close', function(e) {
          if (!forceQuit) {
            e.preventDefault();
            mainWindow.hide();
          }
        });

        app.on('activate', () => {
          mainWindow.show();
        });

        app.on('before-quit', () => {
          forceQuit = true;
        });
      } else {
        mainWindow.on('closed', () => {
          mainWindow = null;
        });
      }
    });

    mainWindow.webContents.on('new-window', (event, windowUrl, frameName, disposition, options) => {
      event.preventDefault();

      // Default window size (ex: dashboard)
      let width = dashboardSize.width;

      let height = dashboardSize.height;

      let opacity = 1;

      if (frameName === 'partkey') {
        width = 364;
        height = 462;
      }

      const mainWindowPosition = mainWindow.getPosition();
      const mainWindowSize = mainWindow.getSize();

      const childWindowOffsetX = mainWindowPosition[0] + (mainWindowSize[0] / 2) - (width / 2);
      const childWindowOffsetY = mainWindowPosition[1] + (mainWindowSize[1] / 2) - (height / 2);

      Object.assign(options, {
        parent: mainWindow,
        width,
        height,
        minWidth: width,
        minHeight: height,
        x: Math.round(childWindowOffsetX),
        y: Math.round(childWindowOffsetY),
        fullscreenable: false,
        maximizable: false,
        resizable: process.env.NODE_ENV === 'development',
        webPreferences: {
          nodeIntegration: true
        },
        show: false,
        opacity,
        useContentSize: true,
      });

      const newWindow = new BrowserWindow(options);

      newWindow.setMenu(null);
      newWindow.webContents.once('did-finish-load', () => {
        // Wait a little to finish copying of styles
        setTimeout(() => {newWindow.show();}, 30);
      });
      if (isDevelopment) {
        newWindow.webContents.on('context-menu', (e, props) => {
          Menu.buildFromTemplate([{
            label: 'Inspect element',
            click() {
              newWindow.inspectElement(props.x, props.y);
            }
          }]).popup(newWindow);
        });
      }

      const closeHandler = function(window) {
        ipcMain.removeAllListeners('close-subwindow');
          window.close();
        delete windows[window.id];
        try {
          mainWindow.focus();
        } catch (e) {
          console.warn(e);
        }
      };

      newWindow.on('close', (e) => {
        const targetWindowId = Object.keys(windows).find(id => windows[id].frameName === e.sender.frameName);

        delete windows[targetWindowId];
        ipcMain.removeAllListeners('close-subwindow');
      });

      ipcMain.on('close-subwindow', closeHandler.bind(this, newWindow));

      event.newGuest = newWindow;
      windows[newWindow.id] = newWindow;
      newWindow.setContentSize = newWindow.setContentSize.bind(newWindow);
    });

    if (isDevelopment) {
      // add inspect element on right click menu
      mainWindow.webContents.on('context-menu', (e, props) => {
        Menu.buildFromTemplate([{
          label: 'Inspect element',
          click() {
            mainWindow.inspectElement(props.x, props.y);
          }
        }]).popup(mainWindow);
      });
    }
  });
}

ipcMain.on('resizeWindow', (event, width, height, frameName) => {
  if (frameName) {
    const targetWindowId = Object.keys(windows).find(id => windows[id].frameName === frameName);

    if (targetWindowId) {
      try {
        windows[targetWindowId].setContentSize(width, height);
      } catch (e) {
        console.error('failed to setContentSize', windows, targetWindowId);
      }
    }
  } else {
    mainWindow.setContentSize(width, height);
  }
});

ipcMain.on('saveFile', (event, savePath, serializedContent, isTemp) => {
  let pathToSave = savePath;

  if (isTemp) {
    pathToSave = path.join(app.getPath('userData'), './', savePath);
  }

  fs.writeFile(pathToSave, serializedContent, function(err) {
    if (err) throw err;
    event.sender.send('fileSaved', pathToSave);
  });
});

ipcMain.on('removeTempFile', (event, savePath) => {
  if (!savePath || !savePath.endsWith('.test')) return;

  const pathToSave = path.join(app.getPath('userData'), './', savePath);

  fs.unlink(pathToSave, function(err) {
    if (err) return;
    event.sender.send('fileRemoved', pathToSave);
  });
});

ipcMain.on('onDragOutStart', (event, filePath) => {
  let iconPath = path.join(__dirname, 'file.png');

  event.sender.startDrag({
    file: filePath,
    icon: iconPath
  });
});
