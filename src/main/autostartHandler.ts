import { app, ipcMain } from 'electron';

const setOpenAtLogin = (openAtLogin: boolean) => {
  app.setLoginItemSettings({
    openAtLogin,
    openAsHidden: openAtLogin,
    ...(process.platform === 'win32' && app.isPackaged
      ? { path: process.execPath }
      : {}),
  });
};

export const registerAutostartHandler = () => {
  ipcMain.handle('get-open-at-login', () => {
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle('set-open-at-login', (_event, enabled: boolean) => {
    setOpenAtLogin(Boolean(enabled));
    return app.getLoginItemSettings().openAtLogin;
  });
};

export const destroyAutostartHandler = () => {
  ipcMain.removeHandler('get-open-at-login');
  ipcMain.removeHandler('set-open-at-login');
};
