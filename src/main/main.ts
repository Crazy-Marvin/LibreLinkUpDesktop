/* eslint global-require: off, no-console: off, promise/always-return: off */
import path from "path"
import { app, BrowserWindow, ipcMain, shell } from "electron"
// import { autoUpdater } from "electron-updater"
// import log from "electron-log"
import MenuBuilder from "./menu"
import { resolveHtmlPath } from "./util"
import { WindowStateManager, WindowState } from './windowState';
import { WindowModeManager } from "./windowMode";
import { registerWindowHandlers, destroyWindowHandlers } from "./windowHandler";
import { registerLogoutHandler, destroyLogoutHandler } from "./logoutHandler";
import { registerRefreshHandler, destroyRefreshHandler } from "./refreshHandler";
import { registerAlertHandler, destroyAlertHandler } from "./alertHandler";
import { registerTrayHandler, destroyTrayHandler, setTrayMainWindow } from "./trayHandler";
import { destroyTray } from './../renderer/lib/trayManager';

// class AppUpdater {
//   constructor() {
//     log.transports.file.level = 'info'
//     autoUpdater.logger = log
//     autoUpdater.checkForUpdatesAndNotify()
//   }
// }

let mainWindow: BrowserWindow | null = null
let isQuitting = false

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'

if (isDebug) {
  require('electron-debug')()
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer')
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS
  const extensions = ['REACT_DEVELOPER_TOOLS']

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log)
}

const windowModeManager = new WindowModeManager('main-window');
const windowMode = windowModeManager.getWindowMode();

const createWindow = async () => {
  if (isDebug) {
    await installExtensions()
  }

  const windowOptions = getWindowOptions(windowMode);

  mainWindow = new BrowserWindow(windowOptions);

  mainWindow.isPrimary = true;

  // 👉 save window state
  const defaultWindowState: WindowState = {
    width: 1024,
    height: 728,
  };

  if(windowMode !== 'overlayTransparent') {
    const windowStateManager = new WindowStateManager('main', defaultWindowState, windowMode);
    windowStateManager.manage(mainWindow);
  }

  mainWindow.loadURL(resolveHtmlPath('index.html'))

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize()
      mainWindow.focus()
    } else {
      mainWindow.show()
    }

    setTrayMainWindow(mainWindow);

  })

  mainWindow.on('close', function (event) {
    if (process.platform === 'darwin' && !isQuitting) {
      event.preventDefault();
      try {
        (this as BrowserWindow).hide();
      } catch {
        // no-op: window may already be tearing down under hot-reload
      }
      return;
    }
    // allow close on non-mac or when quitting
  });


  mainWindow.on('closed', () => {
    mainWindow = null;
    destroyTray();
  })

  app.on('before-quit', () => {
   isQuitting = true;
  });

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url)
    return { action: 'deny' }
  })

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater()
}

const getWindowOptions = (windowMode: 'overlay' | 'windowed' | 'overlayTransparent'): Electron.BrowserWindowConstructorOptions => {

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets')

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths)
  }

  const baseOptions: Electron.BrowserWindowConstructorOptions = {
    show: false,
    minWidth: 200,
    minHeight: 45,
    // icon: getAssetPath('icon.png'),
    webPreferences: {
      webSecurity: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    resizable: true,
    movable: true,
  };

  if (windowMode === 'overlay') {
    return {
      ...baseOptions,
      width: 800,
      height: 600,
      alwaysOnTop: true,
      frame: false,
    };
  }
  if (windowMode === 'overlayTransparent') {
    return {
      ...baseOptions,
      width: 200,
      height: 45,
      alwaysOnTop: true,
      frame: false,
      transparent: true,
      resizable: false,
      hasShadow: false,
    };
  }
  else if (windowMode === 'windowed') {
    return {
      ...baseOptions,
      width: 1024,
      height: 728,
      frame: true,
    };
  }

  return baseOptions;
}


/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  destroyWindowHandlers();
  destroyLogoutHandler();
  destroyRefreshHandler();
  destroyAlertHandler();
  destroyTrayHandler();
  destroyTray();
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app
  .whenReady()
  .then(() => {
    createWindow()
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      // if (mainWindow === null) createWindow()
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow();
        } else {
          // If windows exist but are minimized or hidden, show them
          BrowserWindow.getAllWindows().forEach(win => {
            if (win.isMinimized()) win.restore();
            win.show();
            win.focus();
          });
        }
    })
  })
  .catch(console.log)

// Utils that calls invoke
ipcMain.handle('ipc-open-file', async (event, ...args) => {
  const appPath = app.isPackaged
    ? app.getAppPath()
    : path.join(__dirname, '..')

  const filePath = path.join(appPath, '..', 'assets', 'resources', ...args)
  shell.openPath(filePath)
})


registerWindowHandlers();
registerLogoutHandler();
registerRefreshHandler();
registerAlertHandler();
registerTrayHandler();

export const getMainWindow = () => mainWindow;
