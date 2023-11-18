import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function openFile(type: string, folder: string, group: string, filename: string) {
  await window.electron.ipcRenderer.invoke('ipc-open-file', type, folder, group, filename)
}
