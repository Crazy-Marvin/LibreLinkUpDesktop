import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useAuthStore } from '../stores/auth'
import CryptoJS from 'crypto-js';
import { getCGMData } from '@/lib/linkup';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function openFile(type: string, folder: string, group: string, filename: string) {
  await window.electron.ipcRenderer.invoke('ipc-open-file', type, folder, group, filename)
}

export async function openNewWindow(path: string, width: number, height: number) {
 await window.electron.ipcRenderer.sendMessage('open-new-window', path, width, height)
}

export async function setWindowMode(mode: string) {
  await window.electron.ipcRenderer.sendMessage('set-window-mode', mode)
}

export async function getWindowMode() {
  return await window.electron.ipcRenderer.invoke('get-window-mode')
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
  window.electron.ipcRenderer.sendMessage('logout')
}

export function sendRefreshAllWindows() {
  window.electron.ipcRenderer.sendMessage('refresh-all')
}

export function sendRefreshPrimaryWindow() {
  window.electron.ipcRenderer.sendMessage('refresh-primary')
}

export function triggerWarningAlert(alertOptions: any){
  window.electron.ipcRenderer.sendMessage('trigger-warning-alerts', alertOptions)
}

export async function getAlertSoundFile() {
  return await window.electron.ipcRenderer.invoke('get-alert-sound-file')
}

export async function uploadCustomAlertSoundFile(fileData: Array<number>) {
  return await window.electron.ipcRenderer.invoke(
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

export function updateTrayNumber(number: number) {
  const { resultUnit } = useAuthStore.getState();
  if (window.electron?.ipcRenderer) {
    window.electron.ipcRenderer.sendMessage('update-tray-number', number, resultUnit);
  }
}

export async function initializeTrayAfterLogin(token: string, country: string, accountId: string) {
  try {
    const glucoseValue = await getGlucoseValueForTray(token, country, accountId);
    updateTrayNumber(glucoseValue);
  } catch (error) {
    console.error('Failed to initialize tray:', error);
  }
}
