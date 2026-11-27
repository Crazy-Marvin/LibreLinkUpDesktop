import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import CryptoJS from 'crypto-js';
import { getCGMData, isCgmApiError, type CgmConnectionData } from '@/lib/linkup';
import { useAuthStore } from '../stores/auth'

/** Readings older than this are treated as a lost sensor connection (minutes). */
export const STALE_GLUCOSE_THRESHOLD_MINUTES = 15;

type GlucoseTimestampFields = {
  Timestamp?: string
  FactoryTimestamp?: string
}

export function parseLibreGlucoseTimestamp(timestamp: string): Date | null {
  const parsed = new Date(timestamp)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed
  }

  const match = timestamp.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)$/i,
  )
  if (!match) {
    return null
  }

  const [, month, day, year, hour, minute, second, meridiem] = match
  let hours = parseInt(hour, 10)
  const isPm = meridiem.toUpperCase() === 'PM'

  if (isPm && hours !== 12) {
    hours += 12
  } else if (!isPm && hours === 12) {
    hours = 0
  }

  const date = new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    hours,
    parseInt(minute, 10),
    parseInt(second, 10),
  )

  return Number.isNaN(date.getTime()) ? null : date
}

export function getMinutesSinceGlucoseReading(
  measurement?: GlucoseTimestampFields | null,
): number | null {
  const timestamp = measurement?.Timestamp ?? measurement?.FactoryTimestamp
  if (!timestamp) {
    return null
  }

  const readingTime = parseLibreGlucoseTimestamp(timestamp)
  if (!readingTime) {
    return null
  }

  return Math.max(0, Math.floor((Date.now() - readingTime.getTime()) / 60000))
}

export function isGlucoseReadingStale(
  connection?: CgmConnectionData | null,
  thresholdMinutes: number = STALE_GLUCOSE_THRESHOLD_MINUTES,
): boolean {
  const minutes = getMinutesSinceGlucoseReading(connection?.glucoseMeasurement)
  return minutes !== null && minutes >= thresholdMinutes
}

/** Formats time since last reading for stale sensor UI (0–59 min, then h+min, then d+h+min). */
export function formatStaleDuration(totalMinutes: number): string {
  const mins = Math.max(0, Math.floor(totalMinutes))

  if (mins < 60) {
    return `${mins} min`
  }

  const minutesInDay = 60 * 24

  if (mins < minutesInDay) {
    const hours = Math.floor(mins / 60)
    const remMin = mins % 60
    return `${hours}h ${remMin}min`
  }

  const days = Math.floor(mins / minutesInDay)
  const remAfterDays = mins % minutesInDay
  const hours = Math.floor(remAfterDays / 60)
  const remMin = remAfterDays % 60
  return `${days}d ${hours}h ${remMin}min`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getIpcRenderer() {
  return window.electron?.ipcRenderer
}

export async function openFile(type: string, folder: string, group: string, filename: string) {
  await getIpcRenderer()?.invoke('ipc-open-file', type, folder, group, filename)
}

export async function openNewWindow(path: string, width: number, height: number) {
  getIpcRenderer()?.sendMessage('open-new-window', path, width, height)
}

export async function setWindowMode(mode: string) {
  getIpcRenderer()?.sendMessage('set-window-mode', mode)
}

export async function getWindowMode(): Promise<string> {
  const ipc = getIpcRenderer()
  if (!ipc) {
    const stored = await getLocalStorageWindowMode()
    return stored ?? 'overlay'
  }
  return ipc.invoke('get-window-mode')
}

export async function setLocalStorageWindowMode(mode: string) {
  await localStorage.setItem('windowMode', mode);
}

export async function getLocalStorageWindowMode(): Promise<string> {
  return await localStorage.getItem('windowMode') as string;
}

export async function setRedirectTo (path: string) {
  await localStorage.setItem('redirectTo', path)
}

export async function getRedirectTo () {
  return localStorage.getItem('redirectTo')
}

export async function clearRedirectTo () {
  await localStorage.removeItem('redirectTo')
}

export function sendLogout() {
  setTrayVisibility(false);
  getIpcRenderer()?.sendMessage('logout')
}

export function sendRefreshAllWindows() {
  getIpcRenderer()?.sendMessage('refresh-all')
}

export function sendRefreshPrimaryWindow() {
  getIpcRenderer()?.sendMessage('refresh-primary')
}

export function triggerWarningAlert(alertOptions: any){
  getIpcRenderer()?.sendMessage('trigger-warning-alerts', alertOptions)
}

export async function getAlertSoundFile() {
  const ipc = getIpcRenderer()
  if (!ipc) {
    return { default: null, custom: null }
  }
  return ipc.invoke('get-alert-sound-file')
}

export async function uploadCustomAlertSoundFile(fileData: Array<number>) {
  return getIpcRenderer()?.invoke(
    'upload-custom-alert-sound',
    fileData,
  );
}

export function getUserValue(value: number): number {
  const { resultUnit } = useAuthStore.getState()

  if (resultUnit === 'mg/dL') {
    return Math.round(value)
  }

  if (resultUnit === 'mmol/L') {
    const convertedValue = value / 18.0182
    return parseFloat(convertedValue.toFixed(1))
  }

  throw new Error(`Unsupported result unit: ${resultUnit}`)
}

export function getUserUnit(): string {
  const { resultUnit } = useAuthStore.getState()

  return resultUnit
}

export function hash256(input: string): string {
  return CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
}

export async function getGlucoseValueForTray(token: string, country: string, accountId: string): Promise<number> {
  try {
    const data = await getCGMData({
      token,
      country,
      accountId,
    });

    if (isCgmApiError(data)) {
      return 0
    }

     if (data?.glucoseMeasurement?.ValueInMgPerDl) {
       const value = getUserValue(data.glucoseMeasurement.ValueInMgPerDl);
       return Math.round(value);
     }

    return 0;
  } catch (error) {
    console.error('Error getting glucose data for tray:', error);
    return 0;
  }
}

export function updateTrayNumber(number: number, targetLow?: number, targetHigh?: number) {
  const trayVisible = localStorage.getItem('trayVisible') !== '0';
  if (!trayVisible) return;

  const { resultUnit } = useAuthStore.getState();
  getIpcRenderer()?.sendMessage(
    'update-tray-number',
    number,
    resultUnit,
    targetLow,
    targetHigh,
  );
}


export const getTrayVisibility = (): boolean => {
  const trayVisible = localStorage.getItem('trayVisible');
  return trayVisible !== '0';
};

export const setTrayVisibility = async (visible: boolean) => {
  localStorage.setItem('trayVisible', visible ? '1' : '0');

  const ipc = getIpcRenderer();
  if (!ipc) {
    return;
  }

  if (visible) {
    ipc.sendMessage('create-tray');
  } else {
    ipc.sendMessage('destroy-tray');
  }
};

export async function getOpenAtLogin(): Promise<boolean> {
  return window.electron.ipcRenderer.invoke('get-open-at-login');
}

export async function setOpenAtLogin(enabled: boolean): Promise<boolean> {
  return window.electron.ipcRenderer.invoke('set-open-at-login', enabled);
}
