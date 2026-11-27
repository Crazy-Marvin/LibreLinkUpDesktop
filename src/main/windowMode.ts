import { app } from 'electron';
import fs from 'fs';
import path from 'path';

export class WindowModeManager {

  private filePath: string;

  constructor(private windowName: string) {
    const userDataPath = app.getPath('userData');
    this.filePath = path.join(userDataPath, `${windowName}-window-mode.json`);
    console.log('filePath', this.filePath);
  }

  getWindowMode(): 'overlay' | 'windowed' | 'overlayTransparent' {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      const parsed = JSON.parse(data);
      return parsed.windowMode;
    } catch (error) {
      return 'windowed';
    }
  }

  setWindowMode(mode: 'overlay' | 'windowed' | 'overlayTransparent') {
    const data = JSON.stringify({ windowMode: mode }, null, 2);
    console.log('setWindowMode', this.filePath, data, mode);
    fs.writeFileSync(this.filePath, data);
  }
}
