import fs from 'fs';
import path from 'path';
import { app, ipcMain } from 'electron';

const AUTOSTART_CONFIGURED_FLAG = '.autostart-configured';

export const applyOpenAtLogin = (openAtLogin: boolean) => {
  app.setLoginItemSettings({
    openAtLogin,
    openAsHidden: openAtLogin,
    ...(process.platform === 'win32' && app.isPackaged
      ? { path: process.execPath }
      : {}),
  });
};

/** One-time login autostart after a fresh Windows install so the app appears in Startup apps. */
export const ensureAutostartAfterInstall = () => {
  if (!app.isPackaged || process.platform !== 'win32') {
    return;
  }

  const flagPath = path.join(app.getPath('userData'), AUTOSTART_CONFIGURED_FLAG);
  if (fs.existsSync(flagPath)) {
    return;
  }

  applyOpenAtLogin(true);
  if (!app.getLoginItemSettings().openAtLogin) {
    return;
  }

  try {
    fs.writeFileSync(flagPath, new Date().toISOString(), 'utf-8');
  } catch {
    // Non-fatal; will retry on next launch if flag was not written
  }
};

export const registerAutostartHandler = () => {
  ipcMain.handle('get-open-at-login', () => {
    return app.getLoginItemSettings().openAtLogin;
  });

  ipcMain.handle('set-open-at-login', (_event, enabled: boolean) => {
    applyOpenAtLogin(Boolean(enabled));
    return app.getLoginItemSettings().openAtLogin;
  });
};

export const destroyAutostartHandler = () => {
  ipcMain.removeHandler('get-open-at-login');
  ipcMain.removeHandler('set-open-at-login');
};
