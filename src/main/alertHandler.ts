import { ipcMain, app} from "electron";
import { getMainWindow } from './main';
import path from 'path';
import fs from 'fs';

const  setupAlertSoundFile = ()  => {
  const appDataDir = app.getPath('userData');
  console.log('App Data directory:', appDataDir);

  const targetFilePath = path.join(appDataDir, 'alert.mp3');

  let sourceFilePath =   path.join(process.resourcesPath, 'assets/sounds/alert.mp3');
    if (!app.isPackaged) {
      // development
      sourceFilePath =   path.join(__dirname, '../../assets/sounds/alert.mp3');
    }

  if (!fs.existsSync(targetFilePath)) {
    try {
      fs.copyFileSync(sourceFilePath, targetFilePath);
      console.log('MP3 file copied to App Data directory:', targetFilePath);
    } catch (err) {
      console.error('Error copying MP3 file:', err);
    }
  } else {
    console.log('MP3 file already exists in App Data directory.');
  }
}

const getAudioFilePath = () => {
  const defaultPath = path.join(app.getPath('userData'), 'alert.mp3');
  const customPath = path.join(app.getPath('userData'), 'custom-alert.mp3');

  return {
    default: fs.existsSync(defaultPath) ? `file://${defaultPath}` : null,
    custom: fs.existsSync(customPath) ? `file://${customPath}` : null,
  };
};

const uploadCustomAlertSoundFile = (fileData: Array<number>) => {
  const appDataDir = app.getPath('userData');
  const targetFilePath = path.join(appDataDir, 'custom-alert.mp3');

  try {
    const fileBuffer = Buffer.from(fileData);
    fs.writeFileSync(targetFilePath, fileBuffer);
    console.log('Custom MP3 file successfully moved to:', targetFilePath);
    return targetFilePath;
  } catch (error) {
    console.error('uploadCustomAlertSoundFile custom MP3 file:', error);
    throw new Error('Failed to move custom MP3 file.');
  }
}

export const registerAlertHandler = () => {

  setupAlertSoundFile()

  ipcMain.on("trigger-warning-alerts", (event, alertOptions) => {
    const mainWindow = getMainWindow();
    if (mainWindow && alertOptions.bringToFrontEnabled) {
      mainWindow.setAlwaysOnTop(true);
      mainWindow.show();
      mainWindow.setAlwaysOnTop(false);
      mainWindow.focus();
    }
    if(mainWindow && alertOptions.flashWindowEnabled) {
      mainWindow.flashFrame(true);
    }
  });

  ipcMain.handle('get-alert-sound-file', async () => {
    const audioFilePath = getAudioFilePath();
    return audioFilePath;
  });

  ipcMain.handle('upload-custom-alert-sound', async (event, fileData) => {
    const targetFilePath = uploadCustomAlertSoundFile(fileData);
    return targetFilePath;
  });
};

export const destroyAlertHandler = () => {
  ipcMain.removeAllListeners("set-custom-sound");
  ipcMain.removeAllListeners("trigger-warning-alerts");
}
