import { ipcMain, BrowserWindow } from "electron";
import { createTray, updateTrayNumber } from './../renderer/lib/trayManager';

let mainWindow: BrowserWindow | null = null;

export const registerTrayHandler = () => {

  ipcMain.on('update-tray-number', (event, number: number) => {

    try {
      updateTrayNumber(number, unit);
    } catch (error) {
      if (mainWindow) {
        createTray(mainWindow);
        updateTrayNumber(number, unit);
      }
    }
  });

  ipcMain.on('create-tray', (event) => {
    if (mainWindow) {
      createTray(mainWindow);
    }
  });
};

export const destroyTrayHandler = () => {
  ipcMain.removeAllListeners('update-tray-number');
  ipcMain.removeAllListeners('create-tray');
  ipcMain.removeAllListeners('destroy-tray');
};

export const setTrayMainWindow = (window: BrowserWindow) => {
  mainWindow = window;
};
