import { ipcMain, BrowserWindow } from "electron";
import { createTray, updateTrayNumber, destroyTray } from './../renderer/lib/trayManager';

let mainWindow: BrowserWindow | null = null;

export const registerTrayHandler = () => {

  ipcMain.on('update-tray-number', (event, number: number, unit: string, targetLow?: number, targetHigh?: number) => {
    try {
      updateTrayNumber(number, unit, targetLow, targetHigh);
    } catch (error) {
      console.error('Error updating tray number:', error);
      if (mainWindow) {
        createTray(mainWindow);
        updateTrayNumber(number, unit, targetLow, targetHigh);
      }
    }
  });

  ipcMain.on('create-tray', (event) => {
    if (mainWindow) {
      createTray(mainWindow);
    }
  });

  ipcMain.on('destroy-tray', (event) => {
    destroyTray();
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
