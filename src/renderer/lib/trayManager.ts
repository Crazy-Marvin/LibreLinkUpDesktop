import { Tray, Menu, nativeImage, BrowserWindow } from 'electron';

// Constants
const TRAY_ICON_SIZE = 16;
const MAX_DISPLAY_NUMBER = 999;
const MIN_DISPLAY_NUMBER = 0;
const CORNER_RADIUS = 3;

const LOW = 70;  // Hypoglycemia threshold (mg/dL)
const HIGH = 240; // Hyperglycemia threshold (mg/dL)

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
  displayValue: string;
  mainWindow: BrowserWindow | null;
  currentUnit: string;
  targetLow: number;
  targetHigh: number;
  isCreated: boolean;
}

// Pre-calculated digit patterns for better performance
const DIGIT_PATTERNS: Record<string, PixelCoordinates[]> = {
  '0': [
    { x: 1, y: 4 }, { x: 2, y: 4 },
    { x: 0, y: 5 }, { x: 3, y: 5 },
    { x: 0, y: 6 }, { x: 3, y: 6 },
    { x: 0, y: 7 }, { x: 3, y: 7 },
    { x: 0, y: 8 }, { x: 3, y: 8 },
    { x: 0, y: 9 }, { x: 3, y: 9 },
    { x: 1, y: 10 }, { x: 2, y: 10 },
  ],
  '1': [
    { x: 1, y: 4 }, { x: 0, y: 5 }, { x: 1, y: 5 },
    { x: 1, y: 6 }, { x: 1, y: 7 }, { x: 1, y: 8 },
    { x: 1, y: 9 }, { x: 0, y: 10 }, { x: 1, y: 10 }, { x: 2, y: 10 },
  ],
  '2': [
    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 },
    { x: 3, y: 5 }, { x: 2, y: 6 }, { x: 1, y: 7 },
    { x: 0, y: 8 }, { x: 0, y: 9 }, { x: 1, y: 9 },
    { x: 2, y: 9 }, { x: 3, y: 9 },
  ],
  '3': [
    { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 0, y: 5 },
    { x: 3, y: 5 }, { x: 3, y: 6 }, { x: 1, y: 7 },
    { x: 2, y: 7 }, { x: 3, y: 8 }, { x: 0, y: 9 },
    { x: 3, y: 9 }, { x: 1, y: 10 }, { x: 2, y: 10 },
  ],
  '4': [
    { x: 2, y: 4 }, { x: 1, y: 5 }, { x: 2, y: 5 },
    { x: 0, y: 6 }, { x: 2, y: 6 }, { x: 0, y: 7 },
    { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 },
    { x: 2, y: 8 }, { x: 2, y: 9 }, { x: 2, y: 10 },
  ],
  '5': [
    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 },
    { x: 0, y: 5 }, { x: 0, y: 6 }, { x: 0, y: 7 }, { x: 1, y: 7 },
    { x: 2, y: 7 }, { x: 3, y: 8 }, { x: 3, y: 9 }, { x: 0, y: 10 },
    { x: 1, y: 10 }, { x: 2, y: 10 },
  ],
  '6': [
    { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 0, y: 5 },
    { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 },
    { x: 0, y: 7 }, { x: 3, y: 7 }, { x: 0, y: 8 },
    { x: 3, y: 8 }, { x: 0, y: 9 }, { x: 3, y: 9 },
    { x: 1, y: 10 }, { x: 2, y: 10 },
  ],
  '7': [
    { x: 0, y: 4 }, { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 3, y: 4 },
    { x: 3, y: 5 }, { x: 2, y: 6 }, { x: 2, y: 7 },
    { x: 2, y: 8 }, { x: 2, y: 9 }, { x: 2, y: 10 },
  ],
  '8': [
    { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 0, y: 5 }, { x: 3, y: 5 },
    { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 0, y: 7 }, { x: 3, y: 7 },
    { x: 0, y: 8 }, { x: 3, y: 8 }, { x: 1, y: 9 }, { x: 2, y: 9 },
  ],
  '9': [
    { x: 1, y: 4 }, { x: 2, y: 4 }, { x: 0, y: 5 }, { x: 3, y: 5 },
    { x: 0, y: 6 }, { x: 3, y: 6 }, { x: 1, y: 7 }, { x: 2, y: 7 },
    { x: 3, y: 7 }, { x: 3, y: 8 }, { x: 2, y: 9 }, { x: 1, y: 10 },
  ],
  'dot': [
    { x: 1, y: 10 }, { x: 2, y: 10 },
  ]
};

// Tray Manager Class
class TrayManager {
  private state: TrayManagerState = {
    tray: null,
    currentNumber: 0,
    displayValue: '0',
    mainWindow: null,
    currentUnit: '',
    targetLow: 70,
    targetHigh: 180,
    isCreated: false,
  };

  public updateTargets(targetLow: number, targetHigh: number): void {
    this.state.targetLow = targetLow;
    this.state.targetHigh = targetHigh;

    if (this.state.tray && this.state.currentNumber !== 0) {
      this.updateExistingTray();
    }
  }

  // Platform detection
  private isUbuntu(): boolean {
    return process.platform === 'linux' &&
           (process.env.XDG_CURRENT_DESKTOP?.includes('GNOME') ||
            process.env.XDG_CURRENT_DESKTOP?.includes('Unity') ||
            /ubuntu/i.test(process.env.OS || ''));
  }

  // Format number for display: 33.345 → 33.35, 3.3 → 3.3, 3.0 → 3
  private formatDisplayNumber(number: number): string {
    if (number >= MAX_DISPLAY_NUMBER) {
      return MAX_DISPLAY_NUMBER.toString();
    }

    if (number <= MIN_DISPLAY_NUMBER) {
      return MIN_DISPLAY_NUMBER.toString();
    }

    // Check if it's a whole number
    if (Number.isInteger(number)) {
      return number.toString();
    }

    // Format to 2 decimal places, but remove trailing .00 and trailing zero after decimal
    const formatted = number.toFixed(2);

    // Remove trailing zeros after decimal point
    if (formatted.endsWith('.00')) {
      return formatted.slice(0, -3);
    } else if (formatted.endsWith('0')) {
      return formatted.slice(0, -1);
    }

    return formatted;
  }

  // Main public methods
  public createTray(window: BrowserWindow): void {
    if (this.state.isCreated && this.state.tray) {
      this.state.mainWindow = window;
      return;
    }

    this.state.mainWindow = window;

    if (!this.state.isCreated) {
      this.isUbuntu() ? this.createUbuntuTray() : this.createStandardTray();
    }
    this.state.isCreated = true;
  }

  public destroyTray(): void {
    this.state.tray?.destroy();
    this.state.tray = null;
    this.state.isCreated = false;
  }

  public updateTrayNumber(
    newNumber: number,
    unit: string,
    targetLow?: number,
    targetHigh?: number,
  ): void {
    const clampedNumber = this.clampNumber(newNumber);
    this.state.currentNumber = clampedNumber;
    this.state.displayValue = this.formatDisplayNumber(clampedNumber);
    this.state.currentUnit = unit;

    if (targetLow !== undefined && targetHigh !== undefined) {
      this.state.targetLow = targetLow;
      this.state.targetHigh = targetHigh;
    }

    if (this.state.tray && this.state.isCreated) {
      this.updateExistingTray();
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
    const trayIcon = this.createTrayIconWithNumber(this.state.displayValue);
    this.createTrayInstance(trayIcon);
  }

  private createUbuntuTray(): void {
    try {
      const trayIcon = this.createTrayIconWithNumber(this.state.displayValue);
      this.createTrayInstance(trayIcon);
    } catch (error) {
      console.error('Failed to create Ubuntu tray with numbers, trying fallback:', error);
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
        this.updateTrayContextMenu();
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
        : this.createTrayIconWithNumber(this.state.displayValue);

      this.state.tray.setImage(newIcon);
      this.updateTrayTooltip();
      this.updateTrayContextMenu();
      this.notifyRenderer();
    } catch (error) {
      console.error('Error updating tray icon:', error);
      this.updateTrayTooltip();
      this.updateTrayContextMenu();
    }
  }

  private updateTrayTooltip(): void {
    this.state.tray?.setToolTip(
      `Blood Sugar: ${this.state.displayValue} ${this.state.currentUnit}`,
    );
  }

  private updateTrayContextMenu(): void {
    if (!this.state.tray) return;

    let { targetLow, targetHigh } = this.state;
    let targetUnit = 'mg/dL';

    // Convert targets to mmol/L if current unit is mmol/L
    if (this.state.currentUnit === 'mmol/L') {
      targetLow = Math.round((targetLow / 18) * 10) / 10;
      targetHigh = Math.round((targetHigh / 18) * 10) / 10;
      targetUnit = 'mmol/L';
    }

    const isWindowVisible = this.state.mainWindow
      ? this.state.mainWindow.isVisible() && !this.state.mainWindow.isDestroyed()
      : false;

    const contextMenuTemplate: Electron.MenuItemConstructorOptions[] = [
      {
        label: `Blood Sugar: ${this.state.displayValue} ${this.state.currentUnit}`,
        enabled: false,
      },
      {
        label: `Target Range: ${targetLow}-${targetHigh} ${targetUnit}`,
        enabled: false,
      },
      { type: 'separator' },
    ];

    if (!isWindowVisible) {
      contextMenuTemplate.push({
        label: 'Show App',
        click: () => {
          this.state.mainWindow?.show();
          this.state.mainWindow?.focus();
          setTimeout(() => this.updateTrayContextMenu(), 100);
        }
      });
    } else {
      contextMenuTemplate.push({
        label: 'Hide App',
        click: () => {
          this.state.mainWindow?.hide();
          setTimeout(() => this.updateTrayContextMenu(), 100);
        }
      });
    }

    contextMenuTemplate.push(
      { type: 'separator' },
      { label: 'Quit', click: () => require('electron').app.quit() }
    );

    const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
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
  private createTrayIconWithNumber(displayValue: string): Electron.NativeImage {
    if (this.isUbuntu()) {
      return this.createSimpleNumberIcon();
    }

    const buffer = this.createIconBuffer();
    this.fillBackground(buffer, this.state.currentNumber);
    this.drawNumber(buffer, displayValue);

    return nativeImage.createFromBuffer(buffer, {
      width: TRAY_ICON_SIZE,
      height: TRAY_ICON_SIZE,
    });
  }

  private createSimpleNumberIcon(): Electron.NativeImage {
    const buffer = this.createIconBuffer();
    const bgColor = this.getBackgroundColorForGlucoseLevel(this.state.currentNumber);

    this.fillRoundedRectangle(buffer, bgColor);
    this.drawSimplifiedNumber(buffer, this.state.displayValue);

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

    // Clear buffer with transparent pixels
    buffer.fill(0);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.isPointInRoundedRect(x, y, width, height, radius)) {
          const index = (y * width + x) * 4;
          buffer[index] = color.r;
          buffer[index + 1] = color.g;
          buffer[index + 2] = color.b;
          buffer[index + 3] = color.a ?? 255;
        }
      }
    }
  }

  private isPointInRoundedRect(x: number, y: number, width: number, height: number, radius: number): boolean {
    if (x < radius && y < radius) {
      const dx = radius - x;
      const dy = radius - y;
      return (dx * dx + dy * dy) <= (radius * radius);
    }
    if (x >= width - radius && y < radius) {
      const dx = x - (width - radius - 1);
      const dy = radius - y;
      return (dx * dx + dy * dy) <= (radius * radius);
    }
    if (x < radius && y >= height - radius) {
      const dx = radius - x;
      const dy = y - (height - radius - 1);
      return (dx * dx + dy * dy) <= (radius * radius);
    }
    if (x >= width - radius && y >= height - radius) {
      const dx = x - (width - radius - 1);
      const dy = y - (height - radius - 1);
      return (dx * dx + dy * dy) <= (radius * radius);
    }
    return true;
  }

  // Color utility methods
  private getBackgroundColorForGlucoseLevel(level: number): RGBAColor {
    let targetLow = this.state.targetLow;
    let targetHigh = this.state.targetHigh;
    let lowThreshold = LOW;
    let highThreshold = HIGH;

    if (this.state.currentUnit === 'mmol/L') {
      targetLow /= 18;
      targetHigh /= 18;
      lowThreshold /= 18;
      highThreshold /= 18;
    }

    if (level < lowThreshold) return { r: 68, g: 68, b: 255, a: 255 };
    if (level > highThreshold) return { r: 22, g: 100, b: 249, a: 255 };
    if ((level < targetLow && level >= lowThreshold) || (level > targetHigh && level <= highThreshold)) {
      return { r: 11, g: 200, b: 245, a: 255 };
    }

    return { r: 94, g: 197, b: 34, a: 255 };
  }

  private getColorForGlucoseLevel(level: number): RGBAColor {
    const scale = this.state.currentUnit === 'mmol/L' ? 1 / 18 : 1;
    const targetLow = this.state.targetLow * scale;
    const targetHigh = this.state.targetHigh * scale;
    const lowTh = LOW * scale;
    const highTh = HIGH * scale;

    const inWarning = (level >= lowTh && level < targetLow) || (level > targetHigh && level <= highTh);
    return inWarning ? { r: 0, g: 0, b: 0, a: 255 } : { r: 255, g: 255, b: 255, a: 255 };
  }

  // Drawing methods for decimal values
  private drawNumber(buffer: Buffer, displayValue: string): void {
    const textColor = { r: 255, g: 255, b: 255, a: 255 };
    this.drawDisplayValue(buffer, displayValue, textColor);
  }

  private drawSimplifiedNumber(buffer: Buffer, displayValue: string): void {
    const color = this.getColorForGlucoseLevel(this.state.currentNumber);
    this.drawDisplayValue(buffer, displayValue, color);
  }

  private drawDisplayValue(buffer: Buffer, displayValue: string, color: RGBAColor): void {
    const hasDecimal = displayValue.includes('.');
    const parts = hasDecimal ? displayValue.split('.') : [displayValue];

    if (!hasDecimal) {
      // Whole number
      this.drawWholeNumber(buffer, displayValue, color);
    } else {
      // Decimal number - draw integer part, decimal point, and fractional part
      this.drawDecimalNumber(buffer, parts[0], parts[1], color);
    }
  }

  private drawWholeNumber(buffer: Buffer, numberStr: string, color: RGBAColor): void {
    switch (numberStr.length) {
      case 1:
        this.drawSingleDigit(buffer, numberStr, 6, color);
        break;
      case 2:
        this.drawSingleDigit(buffer, numberStr[0], 3, color);
        this.drawSingleDigit(buffer, numberStr[1], 8, color);
        break;
      case 3:
        this.drawSingleDigit(buffer, numberStr[0], 1, color);
        this.drawSingleDigit(buffer, numberStr[1], 6, color);
        this.drawSingleDigit(buffer, numberStr[2], 11, color);
        break;
    }
  }

  private drawDecimalNumber(buffer: Buffer, integerPart: string, fractionalPart: string, color: RGBAColor): void {
    const totalLength = integerPart.length + fractionalPart.length + 1; // +1 for decimal point

    // Calculate starting position based on total length
    let startX = 1;
    if (totalLength === 3) startX = 3; // e.g., "3.3"
    if (totalLength === 4) startX = 1; // e.g., "33.3"
    if (totalLength >= 5) startX = 0; // e.g., "33.35"

    let currentX = startX;

    // Draw integer part
    for (let i = 0; i < integerPart.length; i++) {
      this.drawSingleDigit(buffer, integerPart[i], currentX, color);
      currentX += 4;
    }

    // Draw decimal point
    this.drawDecimalPoint(buffer, currentX, color);
    currentX += 2;

    // Draw fractional part
    for (let i = 0; i < fractionalPart.length; i++) {
      this.drawSingleDigit(buffer, fractionalPart[i], currentX, color);
      currentX += 4;
    }
  }

  private drawSingleDigit(buffer: Buffer, digit: string, xOffset: number, color: RGBAColor): void {
    const pattern = DIGIT_PATTERNS[digit];
    if (pattern) {
      pattern.forEach(({ x, y }) => this.setPixel(buffer, x + xOffset, y, color));
    }
  }

  private drawDecimalPoint(buffer: Buffer, xOffset: number, color: RGBAColor): void {
    const pattern = DIGIT_PATTERNS['dot'];
    if (pattern) {
      pattern.forEach(({ x, y }) => this.setPixel(buffer, x + xOffset, y, color));
    }
  }

  private setPixel(buffer: Buffer, x: number, y: number, color: RGBAColor): void {
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

// Export public API
export const createTray = (window: BrowserWindow) => trayManager.createTray(window);
export const updateTrayNumber = (newNumber: number, unit: string, targetLow?: number, targetHigh?: number) =>
  trayManager.updateTrayNumber(newNumber, unit, targetLow, targetHigh);
export const updateTrayTargets = (targetLow: number, targetHigh: number) =>
  trayManager.updateTargets(targetLow, targetHigh);
export const destroyTray = () => trayManager.destroyTray();
export const hasTray = () => trayManager.hasTray();
export const isTrayCreated = () => trayManager.getCreationState();
