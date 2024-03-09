import { app, BrowserWindow, Rectangle } from 'electron';
import fs from 'fs';
import path from 'path';

export interface WindowState {
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export class WindowStateManager {
  private stateFilePath: string;

  private state: WindowState;

  constructor(private windowName: string, private defaultState: WindowState) {
    const userDataPath = app.getPath('userData');
    this.stateFilePath = path.join(userDataPath, `${windowName}-window-state.json`);
    this.state = this.readState();
  }

  private readState(): WindowState {
    try {
      return JSON.parse(fs.readFileSync(this.stateFilePath, 'utf-8'));
    } catch (error) {
      return this.defaultState;
    }
  }

  private saveState(state: WindowState): void {
    fs.writeFileSync(this.stateFilePath, JSON.stringify(state));
  }

  public manage(window: BrowserWindow): void {
    this.restore(window);

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    window.on('resize', () => {
      if (resizeTimeout !== null) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        this.save(window.getBounds());
      }, 500);
    });

    window.on('move', () => {
      this.save(window.getBounds());
    });
  }

  private restore(window: BrowserWindow): void {
    window.setBounds(this.state);
  }

  private save(bounds: Rectangle): void {
    this.state = {
      ...this.state,
      ...bounds,
    };
    this.saveState(this.state);
  }
}
