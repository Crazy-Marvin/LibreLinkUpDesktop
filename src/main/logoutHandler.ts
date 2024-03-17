import { BrowserWindow, ipcMain } from "electron"

export const registerLogoutHandler = () => {
  ipcMain.on('logout', () => {
    BrowserWindow.getAllWindows().forEach(window => {
      if (window.webContents) {
        window.webContents.send('logout-event');
        if (!window.isPrimary) {
          window.close();
        }
      }
    });
  });
}

export const destroyLogoutHandler = () => {
  ipcMain.removeAllListeners('logout');
}
