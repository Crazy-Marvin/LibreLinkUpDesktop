import { Tray, Menu, nativeImage, BrowserWindow } from 'electron';

let tray: Tray | null = null;
let currentNumber: number = 0;
let mainWindow: BrowserWindow | null = null;
let currentUnit: string = '';

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

function createTray(window: BrowserWindow): void {
  mainWindow = window;
  const trayIcon = createTrayIconWithNumber(currentNumber);

  tray = new Tray(trayIcon);

  updateTrayContextMenu();
  tray.setToolTip(`Blood Sugar: ${currentNumber} ${currentUnit}`);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

function createTrayIconWithNumber(number: number = 1): Electron.NativeImage {
  const size = 16;

  // Create a transparent 16x16 RGBA buffer.
  const buffer = Buffer.alloc(size * size * 4);

  // Fill with fully transparent pixels.
  for (let i = 0; i < buffer.length; i += 4) {
    buffer[i] = 0;     // R
    buffer[i + 1] = 0; // G
    buffer[i + 2] = 0; // B
    buffer[i + 3] = 0; // A - Fully transparent
  }

  // Draw the number based on the input.
  drawNumber(buffer, size, number);

  return nativeImage.createFromBuffer(buffer, {
    width: size,
    height: size
  });
}

function drawNumber(buffer: Buffer, size: number, number: number): void {
  const numStr = number > 999 ? '999' : number.toString();

  if (numStr.length === 1) {
    drawSingleDigit(buffer, size, parseInt(numStr), 6);
  } else if (numStr.length === 2) {
    drawTwoDigits(buffer, size, numStr);
  } else if (numStr.length === 3) {
    drawThreeDigits(buffer, size, numStr);
  }
}

function drawSingleDigit(buffer: Buffer, size: number, digit: number, xOffset: number = 6): void {
  switch(digit) {
    case 1: drawDigit1(buffer, size, xOffset); break;
    case 2: drawDigit2(buffer, size, xOffset); break;
    case 3: drawDigit3(buffer, size, xOffset); break;
    case 4: drawDigit4(buffer, size, xOffset); break;
    case 5: drawDigit5(buffer, size, xOffset); break;
    case 6: drawDigit6(buffer, size, xOffset); break;
    case 7: drawDigit7(buffer, size, xOffset); break;
    case 8: drawDigit8(buffer, size, xOffset); break;
    case 9: drawDigit9(buffer, size, xOffset); break;
    case 0: drawDigit0(buffer, size, xOffset); break;
  }
}

function drawTwoDigits(buffer: Buffer, size: number, digits: string): void {
  const digit1 = parseInt(digits[0]);
  const digit2 = parseInt(digits[1]);

  drawSingleDigit(buffer, size, digit1, 3);
  drawSingleDigit(buffer, size, digit2, 8);
}

function drawThreeDigits(buffer: Buffer, size: number, digits: string): void {
  const digit1 = parseInt(digits[0]);
  const digit2 = parseInt(digits[1]);
  const digit3 = parseInt(digits[2]);

  // Use smaller spacing for 3 digits to fit.
  drawSingleDigit(buffer, size, digit1, 1);
  drawSingleDigit(buffer, size, digit2, 6);
  drawSingleDigit(buffer, size, digit3, 10);
}

function drawDigit0(buffer: Buffer, size: number, xOffset: number): void {
  const pixels: PixelCoordinates[] = [
    {x: xOffset+1, y: 4}, {x: xOffset+2, y: 4},
    {x: xOffset, y: 5}, {x: xOffset+3, y: 5},
    {x: xOffset, y: 6}, {x: xOffset+3, y: 6},
    {x: xOffset, y: 7}, {x: xOffset+3, y: 7},
    {x: xOffset, y: 8}, {x: xOffset+3, y: 8},
    {x: xOffset, y: 9}, {x: xOffset+3, y: 9},
    {x: xOffset+1, y: 10}, {x: xOffset+2, y: 10}
  ];
  pixels.forEach(({x, y}) => setPixel(buffer, size, x, y, {r: 255, g: 255, b: 255, a: 255}));
}

function drawDigit1(buffer: Buffer, size: number, xOffset: number): void {
  const pixels: PixelCoordinates[] = [
    {x: xOffset+1, y: 4},
    {x: xOffset, y: 5}, {x: xOffset+1, y: 5},
    {x: xOffset+1, y: 6},
    {x: xOffset+1, y: 7},
    {x: xOffset+1, y: 8},
    {x: xOffset+1, y: 9},
    {x: xOffset, y: 10}, {x: xOffset+1, y: 10}, {x: xOffset+2, y: 10}
  ];
  pixels.forEach(({x, y}) => setPixel(buffer, size, x, y, {r: 255, g: 255, b: 255, a: 255}));
}

function drawDigit2(buffer: Buffer, size: number, xOffset: number): void {
  const pixels: PixelCoordinates[] = [
    {x: xOffset, y: 4}, {x: xOffset+1, y: 4}, {x: xOffset+2, y: 4},
    {x: xOffset+3, y: 5},
    {x: xOffset+2, y: 6},
    {x: xOffset+1, y: 7},
    {x: xOffset, y: 8},
    {x: xOffset, y: 9}, {x: xOffset+1, y: 9}, {x: xOffset+2, y: 9}, {x: xOffset+3, y: 9}
  ];
  pixels.forEach(({x, y}) => setPixel(buffer, size, x, y, {r: 255, g: 255, b: 255, a: 255}));
}

function drawDigit3(buffer: Buffer, size: number, xOffset: number): void {
  const pixels: PixelCoordinates[] = [
    {x: xOffset+1, y: 4}, {x: xOffset+2, y: 4},
    {x: xOffset, y: 5}, {x: xOffset+3, y: 5},
    {x: xOffset+3, y: 6},
    {x: xOffset+1, y: 7}, {x: xOffset+2, y: 7},
    {x: xOffset+3, y: 8},
    {x: xOffset, y: 9}, {x: xOffset+3, y: 9},
    {x: xOffset+1, y: 10}, {x: xOffset+2, y: 10}
  ];
  pixels.forEach(({x, y}) => setPixel(buffer, size, x, y, {r: 255, g: 255, b: 255, a: 255}));
}

function drawDigit4(buffer: Buffer, size: number, xOffset: number): void {
  const pixels: PixelCoordinates[] = [
    {x: xOffset+2, y: 4},
    {x: xOffset+1, y: 5}, {x: xOffset+2, y: 5},
    {x: xOffset, y: 6}, {x: xOffset+2, y: 6},
    {x: xOffset, y: 7}, {x: xOffset+1, y: 7}, {x: xOffset+2, y: 7}, {x: xOffset+3, y: 7},
    {x: xOffset+2, y: 8},
    {x: xOffset+2, y: 9},
    {x: xOffset+2, y: 10}
  ];
  pixels.forEach(({x, y}) => setPixel(buffer, size, x, y, {r: 255, g: 255, b: 255, a: 255}));
}

function drawDigit5(buffer: Buffer, size: number, xOffset: number): void {
  const pixels: PixelCoordinates[] = [
    {x: xOffset, y: 4}, {x: xOffset+1, y: 4}, {x: xOffset+2, y: 4}, {x: xOffset+3, y: 4},
    {x: xOffset, y: 5},
    {x: xOffset, y: 6},
    {x: xOffset, y: 7}, {x: xOffset+1, y: 7}, {x: xOffset+2, y: 7},
    {x: xOffset+3, y: 8},
    {x: xOffset+3, y: 9},
    {x: xOffset, y: 10}, {x: xOffset+1, y: 10}, {x: xOffset+2, y: 10}
  ];
  pixels.forEach(({x, y}) => setPixel(buffer, size, x, y, {r: 255, g: 255, b: 255, a: 255}));
}

function drawDigit6(buffer: Buffer, size: number, xOffset: number): void {
  const pixels: PixelCoordinates[] = [
    {x: xOffset+1, y: 4}, {x: xOffset+2, y: 4},
    {x: xOffset, y: 5},
    {x: xOffset, y: 6}, {x: xOffset+1, y: 6}, {x: xOffset+2, y: 6},
    {x: xOffset, y: 7}, {x: xOffset+3, y: 7},
    {x: xOffset, y: 8}, {x: xOffset+3, y: 8},
    {x: xOffset, y: 9}, {x: xOffset+3, y: 9},
    {x: xOffset+1, y: 10}, {x: xOffset+2, y: 10}
  ];
  pixels.forEach(({x, y}) => setPixel(buffer, size, x, y, {r: 255, g: 255, b: 255, a: 255}));
}

function drawDigit7(buffer: Buffer, size: number, xOffset: number): void {
  const pixels: PixelCoordinates[] = [
    {x: xOffset, y: 4}, {x: xOffset+1, y: 4}, {x: xOffset+2, y: 4}, {x: xOffset+3, y: 4},
    {x: xOffset+3, y: 5},
    {x: xOffset+2, y: 6},
    {x: xOffset+2, y: 7},
    {x: xOffset+2, y: 8},
    {x: xOffset+2, y: 9},
    {x: xOffset+2, y: 10}
  ];
  pixels.forEach(({x, y}) => setPixel(buffer, size, x, y, {r: 255, g: 255, b: 255, a: 255}));
}

function drawDigit8(buffer: Buffer, size: number, xOffset: number): void {
  const pixels: PixelCoordinates[] = [
    {x: xOffset+1, y: 4}, {x: xOffset+2, y: 4},
    {x: xOffset, y: 5}, {x: xOffset+3, y: 5},
    {x: xOffset+1, y: 6}, {x: xOffset+2, y: 6},
    {x: xOffset, y: 7}, {x: xOffset+3, y: 7},
    {x: xOffset, y: 8}, {x: xOffset+3, y: 8},
    {x: xOffset+1, y: 9}, {x: xOffset+2, y: 9},
  ];
  pixels.forEach(({x, y}) => setPixel(buffer, size, x, y, {r: 255, g: 255, b: 255, a: 255}));
}

function drawDigit9(buffer: Buffer, size: number, xOffset: number): void {
  const pixels: PixelCoordinates[] = [
    {x: xOffset+1, y: 4}, {x: xOffset+2, y: 4},
    {x: xOffset, y: 5}, {x: xOffset+3, y: 5},
    {x: xOffset, y: 6}, {x: xOffset+3, y: 6},
    {x: xOffset+1, y: 7}, {x: xOffset+2, y: 7}, {x: xOffset+3, y: 7},
    {x: xOffset+3, y: 8},
    {x: xOffset+2, y: 9},
    {x: xOffset+1, y: 10}
  ];
  pixels.forEach(({x, y}) => setPixel(buffer, size, x, y, {r: 255, g: 255, b: 255, a: 255}));
}

function setPixel(buffer: Buffer, size: number, x: number, y: number, color: RGBAColor): void {
  // Check if the pixel coordinates are within the buffer boundaries.
  if (x >= 0 && x < size && y >= 0 && y < size) {
    const index = (y * size + x) * 4;
    buffer[index] = color.r;
    buffer[index + 1] = color.g;
    buffer[index + 2] = color.b;
    buffer[index + 3] = color.a ?? 255;
  }
}

function updateTrayNumber(newNumber: number,  unit: string): void {
  if (newNumber < 0) newNumber = 0;
  if (newNumber > 999) newNumber = 999;

  currentNumber = newNumber;
  currentUnit = unit;

  if (tray) {
    const newIcon = createTrayIconWithNumber(newNumber);
    tray.setImage(newIcon);
    tray.setToolTip(`Blood Sugar: ${newNumber} ${currentUnit}`);

    // Update context menu to show current number
    updateTrayContextMenu();

    // Notify renderer process if window exists
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('tray-number-updated', newNumber);
    }
  }
}

function updateTrayContextMenu(): void {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Blood Sugar: ${currentNumber} ${currentUnit}`,
      enabled: false
    },
    { type: 'separator' },
    { label: 'Show App', click: () => mainWindow?.show() },
    { label: 'Hide App', click: () => mainWindow?.hide() },
    { type: 'separator' },
    { label: 'Quit', click: () => require('electron').app.quit() }
  ]);

  tray.setContextMenu(contextMenu);
}

export {
  createTray,
  updateTrayNumber
};
