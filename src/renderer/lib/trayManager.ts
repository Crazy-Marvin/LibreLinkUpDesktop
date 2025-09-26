import { Tray, Menu, nativeImage, BrowserWindow } from 'electron';

// Constants
const TRAY_ICON_SIZE = 16;
const MAX_DISPLAY_NUMBER = 999;
const MIN_DISPLAY_NUMBER = 0;

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
    this.state.mainWindow = window;

    if (this.isUbuntu()) {
      this.createUbuntuTray();
    } else {
      this.createStandardTray();
    }
  }

  public updateTrayNumber(
    newNumber: number,
    unit: string,
    targetLow?: number,
    targetHigh?: number,
  ): void {
    console.log(
      `updateTrayNumber called with: ${newNumber}, ${unit}, targets: ${targetLow}-${targetHigh}`,
    );

    const clampedNumber = this.clampNumber(newNumber);
    this.state.currentNumber = clampedNumber;
    this.state.currentUnit = unit;

    // Update targets if provided
    if (targetLow !== undefined && targetHigh !== undefined) {
      this.state.targetLow = targetLow;
      this.state.targetHigh = targetHigh;
    }

    if (this.state.tray) {
      this.updateExistingTray();
    } else if (this.state.mainWindow) {
      console.log('Tray not found, creating new tray');
      this.createTray(this.state.mainWindow);
    }
  }

  // Private methods
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
      console.log('Ubuntu tray created successfully with number display');
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
      console.log('Ubuntu fallback tray created');
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
    }
  }

  private createTrayInstance(icon: Electron.NativeImage): void {
    this.state.tray = new Tray(icon);
    this.setupTrayEventListeners();
    this.updateTrayTooltip();
    this.updateTrayContextMenu();
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
  }

  private updateExistingTray(): void {
    if (!this.state.tray) return;

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
    if (this.state.tray) {
      this.state.tray.setToolTip(
        `Blood Sugar: ${this.state.currentNumber} ${this.state.currentUnit}`,
      );
    }
  }

  private updateTrayContextMenu(): void {
    if (!this.state.tray) return;

    let targetLow = this.state.targetLow;
    let targetHigh = this.state.targetHigh;
    let targetUnit = 'mg/dL';

    // Convert targets to mmol/L if current unit is mmol/L
    if (this.state.currentUnit === 'mmol/L') {
      targetLow = Math.round((targetLow / 18) * 10) / 10; // Convert and round to 1 decimal
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
    this.fillSemiTransparentBackground(buffer);
    this.drawSimplifiedNumber(buffer, this.state.currentNumber);

    return nativeImage.createFromBuffer(buffer, {
      width: TRAY_ICON_SIZE,
      height: TRAY_ICON_SIZE,
    });
  }

  private createBasicIcon(): Electron.NativeImage {
    const buffer = Buffer.alloc(TRAY_ICON_SIZE * TRAY_ICON_SIZE * 4);

    // Fill with a visible color
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 70; // R
      buffer[i + 1] = 130; // G
      buffer[i + 2] = 200; // B
      buffer[i + 3] = 255; // A
    }

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
    this.fillBufferWithColor(buffer, bgColor);
  }

  private fillSemiTransparentBackground(buffer: Buffer): void {
    const bgColor: RGBAColor = { r: 40, g: 40, b: 40, a: 220 };
    this.fillBufferWithColor(buffer, bgColor);
  }

  private fillBufferWithColor(buffer: Buffer, color: RGBAColor): void {
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = color.r;
      buffer[i + 1] = color.g;
      buffer[i + 2] = color.b;
      buffer[i + 3] = color.a ?? 255;
    }
  }

  // Color utility methods
  private getBackgroundColorForGlucoseLevel(level: number): RGBAColor {
    let targetLow = this.state.targetLow;
    let targetHigh = this.state.targetHigh;

    // Convert targets to mmol/L scale if current unit is mmol/L
    if (this.state.currentUnit === 'mmol/L') {
      targetLow = targetLow / 18;
      targetHigh = targetHigh / 18;
    }

    if (level < targetLow) return { r: 80, g: 20, b: 20, a: 220 }; // Dark red
    if (level > targetHigh) return { r: 80, g: 50, b: 0, a: 220 }; // Dark orange
    return { r: 20, g: 60, b: 20, a: 220 }; // Dark green
  }

  private getColorForGlucoseLevel(level: number): RGBAColor {
    let targetLow = this.state.targetLow;
    let targetHigh = this.state.targetHigh;

    // Convert targets to mmol/L scale if current unit is mmol/L
    if (this.state.currentUnit === 'mmol/L') {
      targetLow = targetLow / 18;
      targetHigh = targetHigh / 18;
    }

    if (level < targetLow) return { r: 255, g: 200, b: 200, a: 255 }; // Light red
    if (level > targetHigh) return { r: 255, g: 220, b: 150, a: 255 }; // Light orange
    return { r: 200, g: 255, b: 200, a: 255 }; // Light green
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
    const color = this.getColorForGlucoseLevel(number);

    if (numStr.length === 1) {
      this.drawBoldDigit(buffer, parseInt(numStr), 4, color);
    } else if (numStr.length === 2) {
      this.drawBoldDigit(buffer, parseInt(numStr[0]), 1, color);
      this.drawBoldDigit(buffer, parseInt(numStr[1]), 8, color);
    } else if (numStr.length === 3) {
      this.drawBoldDigit(buffer, parseInt(numStr[0]), 0, color);
      this.drawBoldDigit(buffer, parseInt(numStr[1]), 5, color);
      this.drawBoldDigit(buffer, parseInt(numStr[2]), 10, color);
    }
  }

  private drawBoldDigit(
    buffer: Buffer,
    digit: number,
    xOffset: number,
    color: RGBAColor,
  ): void {
    switch (digit) {
      case 1:
        // Bold 1
        for (let y = 3; y <= 10; y++) {
          this.setPixel(buffer, xOffset + 2, y, color);
          if (y >= 9) {
            this.setPixel(buffer, xOffset + 1, y, color);
            this.setPixel(buffer, xOffset + 3, y, color);
          }
        }
        break;
      case 2:
        // Bold 2
        const pixels2 = [
          { x: xOffset + 1, y: 3 },
          { x: xOffset + 2, y: 3 },
          { x: xOffset + 3, y: 4 },
          { x: xOffset + 3, y: 5 },
          { x: xOffset + 2, y: 6 },
          { x: xOffset + 1, y: 7 },
          { x: xOffset, y: 8 },
          { x: xOffset, y: 9 },
          { x: xOffset + 1, y: 9 },
          { x: xOffset + 2, y: 9 },
          { x: xOffset + 3, y: 9 },
        ];
        pixels2.forEach(({ x, y }) => this.setPixel(buffer, x, y, color));
        break;
      case 3:
        // Bold 3
        const pixels3 = [
          { x: xOffset + 1, y: 3 },
          { x: xOffset + 2, y: 3 },
          { x: xOffset + 3, y: 4 },
          { x: xOffset + 3, y: 5 },
          { x: xOffset + 1, y: 6 },
          { x: xOffset + 2, y: 6 },
          { x: xOffset + 3, y: 7 },
          { x: xOffset + 3, y: 8 },
          { x: xOffset + 1, y: 9 },
          { x: xOffset + 2, y: 9 },
        ];
        pixels3.forEach(({ x, y }) => this.setPixel(buffer, x, y, color));
        break;
      default:
        this.drawSingleDigit(buffer, digit, xOffset, color);
        break;
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

  // Individual digit drawing methods (keep the same implementation)
  private drawDigit0(buffer: Buffer, xOffset: number, color: RGBAColor): void {
    const pixels: PixelCoordinates[] = [
      { x: xOffset + 1, y: 4 },
      { x: xOffset + 2, y: 4 },
      { x: xOffset, y: 5 },
      { x: xOffset + 3, y: 5 },
      { x: xOffset, y: 6 },
      { x: xOffset + 3, y: 6 },
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
