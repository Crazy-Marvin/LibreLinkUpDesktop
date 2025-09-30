import { Tray, Menu, nativeImage, BrowserWindow } from 'electron';

// Constants
const TRAY_ICON_SIZE = 16;
const MAX_DISPLAY_NUMBER = 999;
const MIN_DISPLAY_NUMBER = 0;
const CORNER_RADIUS = 3;

const LOW = 55;  // Hypoglycemia threshold (mg/dL)
const HIGH = 250; // Hyperglycemia threshold (mg/dL)

// Interfaces
interface PixelCoordinates {
  x: number;
  y: number;
}

interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

interface TrayManagerState {
  tray: Tray | null;
  currentNumber: number;
  mainWindow: BrowserWindow | null;
  currentUnit: string;
  targetLow: number;
  targetHigh: number;
  isCreated: boolean;
}

// Tray Manager Class
class TrayManager {
  private state: TrayManagerState = {
    tray: null,
    currentNumber: 0,
    mainWindow: null,
    currentUnit: '',
    targetLow: 70,
    targetHigh: 180,
    isCreated: false,
  };

  public updateTargets(targetLow: number, targetHigh: number): void {
    this.state.targetLow = targetLow;
    this.state.targetHigh = targetHigh;

    // Update the tray if it exists to reflect new colors
    if (this.state.tray && this.state.currentNumber !== 0) {
      this.updateExistingTray();
    }
  }

  // Platform detection
  private isUbuntu(): boolean {
    return (
      process.platform === 'linux' &&
      (process.env.XDG_CURRENT_DESKTOP?.includes('GNOME') ||
        process.env.XDG_CURRENT_DESKTOP?.includes('Unity') ||
        /ubuntu/i.test(process.env.OS || ''))
    );
  }

  // Main public methods
  public createTray(window: BrowserWindow): void {
    if (this.state.isCreated && this.state.tray) {
      this.state.mainWindow = window;
      return;
    }

    this.state.mainWindow = window;

    if(!this.state.isCreated){
      if (this.isUbuntu()) {
        this.createUbuntuTray();
      } else {
        this.createStandardTray();
      }
    }
    this.state.isCreated = true;
  }

  public destroyTray(): void {
    if (this.state.tray) {
      this.state.tray.destroy();
      this.state.tray = null;
      this.state.isCreated = false;
    }
  }

  public updateTrayNumber(
    newNumber: number,
    unit: string,
    targetLow?: number,
    targetHigh?: number,
  ): void {
    const clampedNumber = this.clampNumber(newNumber);
    this.state.currentNumber = clampedNumber;
    this.state.currentUnit = unit;

    if (targetLow !== undefined && targetHigh !== undefined) {
      this.state.targetLow = targetLow;
      this.state.targetHigh = targetHigh;
    }

    if (this.state.tray && this.state.isCreated) {
      this.updateExistingTray();
    } else {
    }
  }

  public hasTray(): boolean {
    return this.state.isCreated && this.state.tray !== null;
  }

  public getCreationState(): boolean {
    return this.state.isCreated;
  }

  private clampNumber(number: number): number {
    return Math.max(MIN_DISPLAY_NUMBER, Math.min(MAX_DISPLAY_NUMBER, number));
  }

  private createStandardTray(): void {
    const trayIcon = this.createTrayIconWithNumber(this.state.currentNumber);
    this.createTrayInstance(trayIcon);
  }

  private createUbuntuTray(): void {
    try {
      const trayIcon = this.createTrayIconWithNumber(this.state.currentNumber);
      this.createTrayInstance(trayIcon);
    } catch (error) {
      console.error(
        'Failed to create Ubuntu tray with numbers, trying fallback:',
        error,
      );
      this.createUbuntuFallbackTray();
    }
  }

  private createUbuntuFallbackTray(): void {
    try {
      const simpleIcon = this.createSimpleNumberIcon();
      this.createTrayInstance(simpleIcon);
    } catch (error) {
      console.error('Failed to create Ubuntu fallback tray:', error);
      this.createBasicTray();
    }
  }

  private createBasicTray(): void {
    try {
      const basicIcon = this.createBasicIcon();
      this.createTrayInstance(basicIcon);
    } catch (error) {
      console.error('Complete tray creation failure:', error);
      this.state.isCreated = false;
    }
  }

  private createTrayInstance(icon: Electron.NativeImage): void {
    try {
      this.state.tray = new Tray(icon);
      this.setupTrayEventListeners();
      this.updateTrayTooltip();
      this.updateTrayContextMenu();
      this.state.isCreated = true;
    } catch (error) {
      this.state.isCreated = false;
      throw error;
    }
  }

  private setupTrayEventListeners(): void {
    if (!this.state.tray) return;

    this.state.tray.on('click', () => {
      if (this.state.mainWindow) {
        if (this.state.mainWindow.isVisible()) {
          this.state.mainWindow.hide();
        } else {
          this.state.mainWindow.show();
          this.state.mainWindow.focus();
        }
      }
    });

    this.state.tray.on('destroyed', () => {
      this.state.tray = null;
      this.state.isCreated = false;
    });
  }

  private updateExistingTray(): void {
    if (!this.state.tray || !this.state.isCreated) return;

    try {
      const newIcon = this.isUbuntu()
        ? this.createSimpleNumberIcon()
        : this.createTrayIconWithNumber(this.state.currentNumber);

      this.state.tray.setImage(newIcon);
      this.updateTrayTooltip();
      this.updateTrayContextMenu();
      this.notifyRenderer();
    } catch (error) {
      console.error('Error updating tray icon:', error);
      // Fallback: update tooltip and context menu only
      this.updateTrayTooltip();
      this.updateTrayContextMenu();
    }
  }

  private updateTrayTooltip(): void {
    if (this.state.tray && this.state.isCreated) {
      this.state.tray.setToolTip(
        `Blood Sugar: ${this.state.currentNumber} ${this.state.currentUnit}`,
      );
    }
  }

  private updateTrayContextMenu(): void {
    if (!this.state.tray) return;
    // if (!this.state.tray || !this.state.isCreated) return;

    let targetLow = this.state.targetLow;
    let targetHigh = this.state.targetHigh;
    let targetUnit = 'mg/dL';

    // Convert targets to mmol/L if current unit is mmol/L
    if (this.state.currentUnit === 'mmol/L') {
      targetLow = Math.round((targetLow / 18) * 10) / 10;
      targetHigh = Math.round((targetHigh / 18) * 10) / 10;
      targetUnit = 'mmol/L';
    }

    const contextMenu = Menu.buildFromTemplate([
      {
        label: `Blood Sugar: ${this.state.currentNumber} ${this.state.currentUnit}`,
        enabled: false,
      },
      {
        label: `Target Range: ${targetLow}-${targetHigh} ${targetUnit}`,
        enabled: false,
      },
      { type: 'separator' },
      { label: 'Show App', click: () => this.state.mainWindow?.show() },
      { label: 'Hide App', click: () => this.state.mainWindow?.hide() },
      { type: 'separator' },
      { label: 'Quit', click: () => require('electron').app.quit() },
    ]);

    this.state.tray.setContextMenu(contextMenu);
  }

  private notifyRenderer(): void {
    if (this.state.mainWindow && !this.state.mainWindow.isDestroyed()) {
      this.state.mainWindow.webContents.send(
        'tray-number-updated',
        this.state.currentNumber,
      );
    }
  }

  // Icon creation methods
  private createTrayIconWithNumber(number: number = 1): Electron.NativeImage {
    if (this.isUbuntu()) {
      return this.createSimpleNumberIcon();
    }

    const buffer = this.createIconBuffer();
    this.fillBackground(buffer, number);
    this.drawNumber(buffer, number);

    return nativeImage.createFromBuffer(buffer, {
      width: TRAY_ICON_SIZE,
      height: TRAY_ICON_SIZE,
    });
  }

  private createSimpleNumberIcon(): Electron.NativeImage {
    const buffer = this.createIconBuffer();

    const bgColor = this.getBackgroundColorForGlucoseLevel(
      this.state.currentNumber,
    );
    this.fillRoundedRectangle(buffer, bgColor);

    this.drawSimplifiedNumber(buffer, this.state.currentNumber);

    return nativeImage.createFromBuffer(buffer, {
      width: TRAY_ICON_SIZE,
      height: TRAY_ICON_SIZE,
    });
  }

  private createBasicIcon(): Electron.NativeImage {
    const buffer = Buffer.alloc(TRAY_ICON_SIZE * TRAY_ICON_SIZE * 4);

    const bgColor: RGBAColor = { r: 70, g: 130, b: 200, a: 255 };
    this.fillRoundedRectangle(buffer, bgColor);

    return nativeImage.createFromBuffer(buffer, {
      width: TRAY_ICON_SIZE,
      height: TRAY_ICON_SIZE,
    });
  }

  private createIconBuffer(): Buffer {
    return Buffer.alloc(TRAY_ICON_SIZE * TRAY_ICON_SIZE * 4);
  }

  private fillBackground(buffer: Buffer, number: number): void {
    const bgColor = this.getBackgroundColorForGlucoseLevel(number);
    this.fillRoundedRectangle(buffer, bgColor);
  }

  private fillRoundedRectangle(buffer: Buffer, color: RGBAColor): void {
    const width = TRAY_ICON_SIZE;
    const height = TRAY_ICON_SIZE;
    const radius = CORNER_RADIUS;

    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 0;
      buffer[i + 1] = 0;
      buffer[i + 2] = 0;
      buffer[i + 3] = 0;
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let isInside = true;

        if (x < radius && y < radius) {
          const dx = radius - x;
          const dy = radius - y;
          isInside = (dx * dx + dy * dy) <= (radius * radius);
        } else if (x >= width - radius && y < radius) {
          const dx = x - (width - radius - 1);
          const dy = radius - y;
          isInside = (dx * dx + dy * dy) <= (radius * radius);
        } else if (x < radius && y >= height - radius) {
          const dx = radius - x;
          const dy = y - (height - radius - 1);
          isInside = (dx * dx + dy * dy) <= (radius * radius);
        } else if (x >= width - radius && y >= height - radius) {
          const dx = x - (width - radius - 1);
          const dy = y - (height - radius - 1);
          isInside = (dx * dx + dy * dy) <= (radius * radius);
        }

        if (isInside) {
          const index = (y * width + x) * 4;
          buffer[index] = color.r;
          buffer[index + 1] = color.g;
          buffer[index + 2] = color.b;
          buffer[index + 3] = color.a ?? 255;
        }
      }
    }
  }

  // Color utility methods
  private getBackgroundColorForGlucoseLevel(level: number): RGBAColor {
    let targetLow = this.state.targetLow;
    let targetHigh = this.state.targetHigh;
    let lowThreshold = LOW;
    let highThreshold = HIGH;

    if (this.state.currentUnit === 'mmol/L') {
      targetLow = targetLow / 18;
      targetHigh = targetHigh / 18;
      lowThreshold = LOW / 18;
      highThreshold = HIGH / 18;
    }

    if (level < lowThreshold) {
      return { r: 68, g: 68, b: 255, a: 255 };
    }

    if (level > highThreshold) {
      return { r: 22, g: 100, b: 249, a: 255 };
    }

    if (
      (level < targetLow && level >= lowThreshold) ||
      (level > targetHigh && level <= highThreshold)
    ) {
      return { r: 11, g: 200, b: 245, a: 255 };
    }

    return { r: 94, g: 197, b: 34, a: 255 };
  }

  private getColorForGlucoseLevel(level: number): RGBAColor {
    const scale = this.state.currentUnit === 'mmol/L' ? 1 / 18 : 1;

      const targetLow  = this.state.targetLow  * scale;
      const targetHigh = this.state.targetHigh * scale;
      const lowTh      = LOW  * scale;
      const highTh     = HIGH * scale;

    const inWarning =
      (level >= lowTh && level < targetLow) ||
      (level >  targetHigh && level <= highTh);

    return inWarning
      ? { r: 0,   g: 0,   b: 0,   a: 255 }
      : { r: 255, g: 255, b: 255, a: 255 };
  }


  // Drawing methods
  private drawNumber(buffer: Buffer, number: number): void {
    const numStr =
      number > MAX_DISPLAY_NUMBER
        ? MAX_DISPLAY_NUMBER.toString()
        : number.toString();
    const textColor = { r: 255, g: 255, b: 255, a: 255 };

    if (numStr.length === 1) {
      this.drawSingleDigit(buffer, parseInt(numStr), 6, textColor);
    } else if (numStr.length === 2) {
      this.drawTwoDigits(buffer, numStr, textColor);
    } else if (numStr.length === 3) {
      this.drawThreeDigits(buffer, numStr, textColor);
    }
  }

  private drawSimplifiedNumber(buffer: Buffer, number: number): void {
    const numStr = number > MAX_DISPLAY_NUMBER ? '999' : number.toString();
    const color = this.getColorForGlucoseLevel(parseInt(numStr));

    if (numStr.length === 1) {
      this.drawSingleDigit(buffer, parseInt(numStr), 5, color);
    } else if (numStr.length === 2) {
      this.drawSingleDigit(buffer, parseInt(numStr[0]), 2, color);
      this.drawSingleDigit(buffer, parseInt(numStr[1]), 8, color);
    } else if (numStr.length === 3) {
      this.drawSingleDigit(buffer, parseInt(numStr[0]), 0, color);
      this.drawSingleDigit(buffer, parseInt(numStr[1]), 5, color);
      this.drawSingleDigit(buffer, parseInt(numStr[2]), 10, color);
    }
  }

  private drawSingleDigit(
    buffer: Buffer,
    digit: number,
    xOffset: number,
    color: RGBAColor,
  ): void {
    switch (digit) {
      case 1:
        this.drawDigit1(buffer, xOffset, color);
        break;
      case 2:
        this.drawDigit2(buffer, xOffset, color);
        break;
      case 3:
        this.drawDigit3(buffer, xOffset, color);
        break;
      case 4:
        this.drawDigit4(buffer, xOffset, color);
        break;
      case 5:
        this.drawDigit5(buffer, xOffset, color);
        break;
      case 6:
        this.drawDigit6(buffer, xOffset, color);
        break;
      case 7:
        this.drawDigit7(buffer, xOffset, color);
        break;
      case 8:
        this.drawDigit8(buffer, xOffset, color);
        break;
      case 9:
        this.drawDigit9(buffer, xOffset, color);
        break;
      case 0:
        this.drawDigit0(buffer, xOffset, color);
        break;
    }
  }

  private drawTwoDigits(
    buffer: Buffer,
    digits: string,
    color: RGBAColor,
  ): void {
    const digit1 = parseInt(digits[0]);
    const digit2 = parseInt(digits[1]);
    this.drawSingleDigit(buffer, digit1, 3, color);
    this.drawSingleDigit(buffer, digit2, 8, color);
  }

  private drawThreeDigits(
    buffer: Buffer,
    digits: string,
    color: RGBAColor,
  ): void {
    const digit1 = parseInt(digits[0]);
    const digit2 = parseInt(digits[1]);
    const digit3 = parseInt(digits[2]);
    this.drawSingleDigit(buffer, digit1, 1, color);
    this.drawSingleDigit(buffer, digit2, 6, color);
    this.drawSingleDigit(buffer, digit3, 10, color);
  }

  // Individual digit drawing methods
  private drawDigit0(buffer: Buffer, xOffset: number, color: RGBAColor): void {
    const pixels: PixelCoordinates[] = [
      { x: xOffset + 1, y: 4 }, { x: xOffset + 2, y: 4 },
      { x: xOffset, y: 5 }, { x: xOffset + 3, y: 5 },
      { x: xOffset, y: 6 }, { x: xOffset + 3, y: 6 },
      { x: xOffset, y: 7 }, { x: xOffset + 3, y: 7 },
      { x: xOffset, y: 8 }, { x: xOffset + 3, y: 8 },
      { x: xOffset, y: 9 }, { x: xOffset + 3, y: 9 },
      { x: xOffset + 1, y: 10 }, { x: xOffset + 2, y: 10 },
    ];
    pixels.forEach(({ x, y }) => this.setPixel(buffer, x, y, color));
  }

  private drawDigit1(buffer: Buffer, xOffset: number, color: RGBAColor): void {
    const pixels: PixelCoordinates[] = [
      { x: xOffset + 1, y: 4 },
      { x: xOffset, y: 5 },
      { x: xOffset + 1, y: 5 },
      { x: xOffset + 1, y: 6 },
      { x: xOffset + 1, y: 7 },
      { x: xOffset + 1, y: 8 },
      { x: xOffset + 1, y: 9 },
      { x: xOffset, y: 10 },
      { x: xOffset + 1, y: 10 },
      { x: xOffset + 2, y: 10 },
    ];
    pixels.forEach(({ x, y }) => this.setPixel(buffer, x, y, color));
  }

  private drawDigit2(buffer: Buffer, xOffset: number, color: RGBAColor): void {
    const pixels: PixelCoordinates[] = [
      { x: xOffset, y: 4 },
      { x: xOffset + 1, y: 4 },
      { x: xOffset + 2, y: 4 },
      { x: xOffset + 3, y: 5 },
      { x: xOffset + 2, y: 6 },
      { x: xOffset + 1, y: 7 },
      { x: xOffset, y: 8 },
      { x: xOffset, y: 9 },
      { x: xOffset + 1, y: 9 },
      { x: xOffset + 2, y: 9 },
      { x: xOffset + 3, y: 9 },
    ];
    pixels.forEach(({ x, y }) => this.setPixel(buffer, x, y, color));
  }

  private drawDigit3(buffer: Buffer, xOffset: number, color: RGBAColor): void {
    const pixels: PixelCoordinates[] = [
      { x: xOffset + 1, y: 4 },
      { x: xOffset + 2, y: 4 },
      { x: xOffset, y: 5 },
      { x: xOffset + 3, y: 5 },
      { x: xOffset + 3, y: 6 },
      { x: xOffset + 1, y: 7 },
      { x: xOffset + 2, y: 7 },
      { x: xOffset + 3, y: 8 },
      { x: xOffset, y: 9 },
      { x: xOffset + 3, y: 9 },
      { x: xOffset + 1, y: 10 },
      { x: xOffset + 2, y: 10 },
    ];
    pixels.forEach(({ x, y }) => this.setPixel(buffer, x, y, color));
  }

  private drawDigit4(buffer: Buffer, xOffset: number, color: RGBAColor): void {
    const pixels: PixelCoordinates[] = [
      { x: xOffset + 2, y: 4 },
      { x: xOffset + 1, y: 5 },
      { x: xOffset + 2, y: 5 },
      { x: xOffset, y: 6 },
      { x: xOffset + 2, y: 6 },
      { x: xOffset, y: 7 },
      { x: xOffset + 1, y: 7 },
      { x: xOffset + 2, y: 7 },
      { x: xOffset + 3, y: 7 },
      { x: xOffset + 2, y: 8 },
      { x: xOffset + 2, y: 9 },
      { x: xOffset + 2, y: 10 },
    ];
    pixels.forEach(({ x, y }) => this.setPixel(buffer, x, y, color));
  }

  private drawDigit5(buffer: Buffer, xOffset: number, color: RGBAColor): void {
    const pixels: PixelCoordinates[] = [
      { x: xOffset, y: 4 },
      { x: xOffset + 1, y: 4 },
      { x: xOffset + 2, y: 4 },
      { x: xOffset + 3, y: 4 },
      { x: xOffset, y: 5 },
      { x: xOffset, y: 6 },
      { x: xOffset, y: 7 },
      { x: xOffset + 1, y: 7 },
      { x: xOffset + 2, y: 7 },
      { x: xOffset + 3, y: 8 },
      { x: xOffset + 3, y: 9 },
      { x: xOffset, y: 10 },
      { x: xOffset + 1, y: 10 },
      { x: xOffset + 2, y: 10 },
    ];
    pixels.forEach(({ x, y }) => this.setPixel(buffer, x, y, color));
  }

  private drawDigit6(buffer: Buffer, xOffset: number, color: RGBAColor): void {
    const pixels: PixelCoordinates[] = [
      { x: xOffset + 1, y: 4 },
      { x: xOffset + 2, y: 4 },
      { x: xOffset, y: 5 },
      { x: xOffset, y: 6 },
      { x: xOffset + 1, y: 6 },
      { x: xOffset + 2, y: 6 },
      { x: xOffset, y: 7 },
      { x: xOffset + 3, y: 7 },
      { x: xOffset, y: 8 },
      { x: xOffset + 3, y: 8 },
      { x: xOffset, y: 9 },
      { x: xOffset + 3, y: 9 },
      { x: xOffset + 1, y: 10 },
      { x: xOffset + 2, y: 10 },
    ];
    pixels.forEach(({ x, y }) => this.setPixel(buffer, x, y, color));
  }

  private drawDigit7(buffer: Buffer, xOffset: number, color: RGBAColor): void {
    const pixels: PixelCoordinates[] = [
      { x: xOffset, y: 4 },
      { x: xOffset + 1, y: 4 },
      { x: xOffset + 2, y: 4 },
      { x: xOffset + 3, y: 4 },
      { x: xOffset + 3, y: 5 },
      { x: xOffset + 2, y: 6 },
      { x: xOffset + 2, y: 7 },
      { x: xOffset + 2, y: 8 },
      { x: xOffset + 2, y: 9 },
      { x: xOffset + 2, y: 10 },
    ];
    pixels.forEach(({ x, y }) => this.setPixel(buffer, x, y, color));
  }

  private drawDigit8(buffer: Buffer, xOffset: number, color: RGBAColor): void {
    const pixels: PixelCoordinates[] = [
      { x: xOffset + 1, y: 4 },
      { x: xOffset + 2, y: 4 },
      { x: xOffset, y: 5 },
      { x: xOffset + 3, y: 5 },
      { x: xOffset + 1, y: 6 },
      { x: xOffset + 2, y: 6 },
      { x: xOffset, y: 7 },
      { x: xOffset + 3, y: 7 },
      { x: xOffset, y: 8 },
      { x: xOffset + 3, y: 8 },
      { x: xOffset + 1, y: 9 },
      { x: xOffset + 2, y: 9 },
    ];
    pixels.forEach(({ x, y }) => this.setPixel(buffer, x, y, color));
  }

  private drawDigit9(buffer: Buffer, xOffset: number, color: RGBAColor): void {
    const pixels: PixelCoordinates[] = [
      { x: xOffset + 1, y: 4 },
      { x: xOffset + 2, y: 4 },
      { x: xOffset, y: 5 },
      { x: xOffset + 3, y: 5 },
      { x: xOffset, y: 6 },
      { x: xOffset + 3, y: 6 },
      { x: xOffset + 1, y: 7 },
      { x: xOffset + 2, y: 7 },
      { x: xOffset + 3, y: 7 },
      { x: xOffset + 3, y: 8 },
      { x: xOffset + 2, y: 9 },
      { x: xOffset + 1, y: 10 },
    ];
    pixels.forEach(({ x, y }) => this.setPixel(buffer, x, y, color));
  }

  private setPixel(
    buffer: Buffer,
    x: number,
    y: number,
    color: RGBAColor,
  ): void {
    if (x >= 0 && x < TRAY_ICON_SIZE && y >= 0 && y < TRAY_ICON_SIZE) {
      const index = (y * TRAY_ICON_SIZE + x) * 4;
      buffer[index] = color.r;
      buffer[index + 1] = color.g;
      buffer[index + 2] = color.b;
      buffer[index + 3] = color.a ?? 255;
    }
  }
}

// Create singleton instance
const trayManager = new TrayManager();

export const createTray = (window: BrowserWindow) =>
  trayManager.createTray(window);
export const updateTrayNumber = (
  newNumber: number,
  unit: string,
  targetLow?: number,
  targetHigh?: number,
) => trayManager.updateTrayNumber(newNumber, unit, targetLow, targetHigh);
export const updateTrayTargets = (targetLow: number, targetHigh: number) =>
  trayManager.updateTargets(targetLow, targetHigh);
export const destroyTray = () => trayManager.destroyTray();
export const hasTray = () => trayManager.hasTray();
export const isTrayCreated = () => trayManager.getCreationState();
