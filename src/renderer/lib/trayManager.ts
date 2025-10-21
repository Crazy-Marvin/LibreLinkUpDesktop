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
  previousNumber: number;
  displayValue: string;
  mainWindow: BrowserWindow | null;
  currentUnit: string;
  targetLow: number;
  targetHigh: number;
  isCreated: boolean;
  trendArrow: number;
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

const TREND_ARROW_MAP: Record<number, string> = {
  1: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.14645 2.14645C7.34171 1.95118 7.65829 1.95118 7.85355 2.14645L11.8536 6.14645C12.0488 6.34171 12.0488 6.65829 11.8536 6.85355C11.6583 7.04882 11.3417 7.04882 11.1464 6.85355L8 3.70711L8 12.5C8 12.7761 7.77614 13 7.5 13C7.22386 13 7 12.7761 7 12.5L7 3.70711L3.85355 6.85355C3.65829 7.04882 3.34171 7.04882 3.14645 6.85355C2.95118 6.65829 2.95118 6.34171 3.14645 6.14645L7.14645 2.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`,   // ArrowDownIcon (case 1)
  2: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.3536 3.64644C11.5488 3.8417 11.5488 4.15828 11.3536 4.35354L4.70711 11L9 11C9.27614 11 9.5 11.2239 9.5 11.5C9.5 11.7761 9.27614 12 9 12L3.5 12C3.36739 12 3.24021 11.9473 3.14645 11.8536C3.05268 11.7598 3 11.6326 3 11.5L3 5.99999C3 5.72385 3.22386 5.49999 3.5 5.49999C3.77614 5.49999 4 5.72385 4 5.99999V10.2929L10.6464 3.64643C10.8417 3.45117 11.1583 3.45117 11.3536 3.64644Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`,   // ArrowBottomRightIcon (case 2)
  3: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`,   // ArrowRight (case 3)
  4: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.64645 3.64644C3.45118 3.8417 3.45118 4.15828 3.64645 4.35354L10.2929 11L6 11C5.72386 11 5.5 11.2239 5.5 11.5C5.5 11.7761 5.72386 12 6 12L11.5 12C11.6326 12 11.7598 11.9473 11.8536 11.8536C11.9473 11.7598 12 11.6326 12 11.5L12 5.99999C12 5.72385 11.7761 5.49999 11.5 5.49999C11.2239 5.49999 11 5.72385 11 5.99999V10.2929L4.35355 3.64643C4.15829 3.45117 3.84171 3.45117 3.64645 3.64644Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`,   // ArrowTopRightIcon (case 4)
  5: `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 2C7.77614 2 8 2.22386 8 2.5L8 11.2929L11.1464 8.14645C11.3417 7.95118 11.6583 7.95118 11.8536 8.14645C12.0488 8.34171 12.0488 8.65829 11.8536 8.85355L7.85355 12.8536C7.75979 12.9473 7.63261 13 7.5 13C7.36739 13 7.24021 12.9473 7.14645 12.8536L3.14645 8.85355C2.95118 8.65829 2.95118 8.34171 3.14645 8.14645C3.34171 7.95118 3.65829 7.95118 3.85355 8.14645L7 11.2929L7 2.5C7 2.22386 7.22386 2 7.5 2Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`,   // ArrowUpIcon (case 5)
};

const DEFAULT_ARROW_SVG = `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`;

// Tray Manager Class
class TrayManager {
  private state: TrayManagerState = {
    tray: null,
    currentNumber: 0,
    previousNumber: 0,
    displayValue: '0',
    mainWindow: null,
    currentUnit: '',
    targetLow: 70,
    targetHigh: 180,
    isCreated: false,
    trendArrow: 3,
  };

  private tooltipWindow: BrowserWindow | null = null;

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

    if (this.tooltipWindow) {
      this.tooltipWindow.destroy();
      this.tooltipWindow = null;
    }
  }

  public updateTrayNumber(
    newNumber: number,
    unit: string,
    targetLow?: number,
    targetHigh?: number,
    trendArrow?: number,
  ): void {
    this.state.previousNumber = this.state.currentNumber;

    const clampedNumber = this.clampNumber(newNumber);
    this.state.currentNumber = clampedNumber;
    this.state.displayValue = this.formatDisplayNumber(clampedNumber);
    this.state.currentUnit = unit;

    if (targetLow !== undefined && targetHigh !== undefined) {
      this.state.targetLow = targetLow;
      this.state.targetHigh = targetHigh;
    }

    if (trendArrow !== undefined) {
      this.state.trendArrow = trendArrow;
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
      this.updateTrayContextMenu();
      this.state.isCreated = true;
    } catch (error) {
      this.state.isCreated = false;
      throw error;
    }
  }

  private setupTrayEventListeners(): void {
    if (!this.state.tray) return;

    this.createTooltipWindow();

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
      this.hideTooltip();
    });

    // Show custom tooltip on mouse enter
    this.state.tray.on('mouse-enter', () => {
      if (this.tooltipWindow) {
        this.updateTooltipContent();
        this.showTooltip();
      }
    });

    // Hide custom tooltip on mouse leave
    this.state.tray.on('mouse-leave', () => {
      this.hideTooltip();
    });

    this.state.tray.on('destroyed', () => {
      this.state.tray = null;
      this.state.isCreated = false;
      if (this.tooltipWindow) {
        this.tooltipWindow.destroy();
        this.tooltipWindow = null;
      }
    });
  }

  private createTooltipWindow(): void {
    if (this.tooltipWindow) return;

    this.tooltipWindow = new BrowserWindow({
      width: 200,
      height: 120,
      show: false,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Load the tooltip HTML content
    this.tooltipWindow.loadURL(`data:text/html;charset=utf-8,${this.getTooltipHTML()}`);

    this.tooltipWindow.on('blur', () => {
      this.hideTooltip();
    });

    this.tooltipWindow.on('close', () => {
      this.tooltipWindow = null;
    });
  }

  private getTooltipHTML(): string {
    const { displayValue, currentUnit, currentNumber, trendArrow } = this.state;

    // Get background color and convert to CSS string
    const bgColor = this.rgbToCss(this.getBackgroundColorForGlucoseLevel(currentNumber));
    const textColor = this.rgbToCss(this.getColorForGlucoseLevel(currentNumber));

    const trendSvg = TREND_ARROW_MAP[trendArrow] || DEFAULT_ARROW_SVG;

    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: ${bgColor};
        color: ${textColor};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        box-sizing: border-box;
        user-select: none;
        -webkit-user-select: none;
      }

      .glucose-value {
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        text-align: center;
      }

      .trend-arrow-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.25);
      }

      .trend-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
      }

      .trend-arrow svg {
        width: 100%;
        height: 100%;
        color: white;
      }
    </style>
  </head>
  <body>
    <div class="glucose-value">
      <span>${displayValue}</span>
      <span>${currentUnit}</span>
      <div class="trend-arrow-container">
        <div class="trend-arrow">${trendSvg}</div>
      </div>
    </div>
  </body>
  </html>`;
  }

  private showTooltip(): void {
    if (!this.state.tray || !this.tooltipWindow) return;

    try {
      const trayBounds = this.state.tray.getBounds();
      const windowBounds = this.tooltipWindow.getBounds();

      const x = Math.round(trayBounds.x + (trayBounds.width - windowBounds.width) / 2);
      const y = Math.round(trayBounds.y - windowBounds.height - 5);

      this.tooltipWindow.setPosition(x, y);
      this.tooltipWindow.show();
      this.isShowingTooltip = true;
    } catch (error) {
      console.error('Error showing tooltip:', error);
    }
  }

  private hideTooltip(): void {
    if (this.tooltipWindow) {
      this.tooltipWindow.hide();
      this.isShowingTooltip = false;
    }
  }

  private updateTooltipContent(): void {
    if (this.tooltipWindow && !this.tooltipWindow.isDestroyed()) {
      this.tooltipWindow.loadURL(`data:text/html;charset=utf-8,${this.getTooltipHTML()}`);
    }
  }

  private updateExistingTray(): void {
    if (!this.state.tray || !this.state.isCreated) return;

    try {
      const newIcon = this.isUbuntu()
        ? this.createSimpleNumberIcon()
        : this.createTrayIconWithNumber(this.state.displayValue);

      this.state.tray.setImage(newIcon);
      this.updateTooltipContent();
      this.updateTrayContextMenu();
      this.notifyRenderer();
    } catch (error) {
      console.error('Error updating tray icon:', error);
      this.updateTooltipContent();
      this.updateTrayContextMenu();
    }
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
  const targetLow = this.state.targetLow;
  const targetHigh = this.state.targetHigh;

  // Convert level to mg/dL for consistent comparison if unit is mmol/L
  const levelInMgPerDl = this.state.currentUnit === 'mmol/L' ? level * 18 : level;

  if (levelInMgPerDl < LOW) {
    return { r: 239, g: 68, b: 68, a: 255 }; // bg-red-500
  }

  if (levelInMgPerDl > HIGH) {
    return { r: 249, g: 115, b: 22, a: 255 }; // bg-orange-500
  }

  if ((levelInMgPerDl < targetLow && levelInMgPerDl >= LOW) ||
      (levelInMgPerDl > targetHigh && levelInMgPerDl <= HIGH)) {
    return { r: 8, g: 179, b: 234, a: 255 }; // bg-yellow-500
  }

  return { r: 34, g: 197, b: 94, a: 255 }; // bg-green-500
}

private getColorForGlucoseLevel(level: number): RGBAColor {
  return { r: 255, g: 255, b: 255, a: 255 };
}

// Add helper method to convert RGB to CSS string
private rgbToCss(color: RGBAColor): string {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
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
export const updateTrayNumber = (newNumber: number, unit: string, targetLow?: number, targetHigh?: number, trendArrow?: number) =>
  trayManager.updateTrayNumber(newNumber, unit, targetLow, targetHigh, trendArrow);
export const updateTrayTargets = (targetLow: number, targetHigh: number) =>
  trayManager.updateTargets(targetLow, targetHigh);
export const destroyTray = () => trayManager.destroyTray();
export const hasTray = () => trayManager.hasTray();
export const isTrayCreated = () => trayManager.getCreationState();
