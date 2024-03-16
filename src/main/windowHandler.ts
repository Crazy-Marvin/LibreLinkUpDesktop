import { BrowserWindow, ipcMain, app } from 'electron';
import path from 'path';
import { resolveHtmlPath } from './util';

interface WindowCache {
  [url: string]: BrowserWindow | undefined;
}

export const registerWindowHandlers = () => {
  const windowCache: WindowCache = {};

  // 👉 register window handlers
  ipcMain.on('open-new-window', (event, url, width, height) => {
    // Check if the window for this URL already exists
    if (windowCache[url]) {
      // Focus the existing window if it exists
      if (windowCache[url]) {
        windowCache[url]?.focus();
      }
      return;
    }

    const newWindow = new BrowserWindow({
      width,
      height,
      webPreferences: {
        webSecurity: false,
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });

    newWindow.loadURL(resolveHtmlPath('index.html'));
    windowCache[url] = newWindow;


    newWindow.on('closed', () => {
      windowCache[url] = undefined;
    });

  });
};

export const destroyWindowHandlers = () => {
  // 👉 destroy window handlers
  ipcMain.removeAllListeners('open-new-window');
};
