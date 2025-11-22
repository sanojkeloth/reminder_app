import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Alert actions
  dismissAlert: (alertId: string) => ipcRenderer.send('alert:dismiss', alertId),
  snoozeAlert: (alertId: string, minutes: number) =>
    ipcRenderer.send('alert:snooze', { alertId, minutes }),
  joinMeeting: (alertId: string, meetingUrl: string) =>
    ipcRenderer.send('alert:join-meeting', { alertId, meetingUrl }),

  // Alert listeners
  onAlertShow: (callback: (data: any) => void) =>
    ipcRenderer.on('alert:show', (_event, data) => callback(data)),
  onAlertUpdate: (callback: (data: any) => void) =>
    ipcRenderer.on('alert:update', (_event, data) => callback(data)),

  // Database operations
  getEvents: () => ipcRenderer.invoke('db:get-events'),
  getSettings: () => ipcRenderer.invoke('db:get-settings'),
  updateSettings: (settings: any) => ipcRenderer.invoke('db:update-settings', settings),

  // Calendar operations
  connectGoogle: () => ipcRenderer.invoke('calendar:connect-google'),
  disconnectCalendar: (provider: string) => ipcRenderer.invoke('calendar:disconnect', provider),
  syncCalendars: () => ipcRenderer.invoke('calendar:sync'),

  // Statistics
  getStatistics: (period: string) => ipcRenderer.invoke('stats:get', period),

  // App control
  showMainWindow: () => ipcRenderer.send('app:show-main-window'),
  quitApp: () => ipcRenderer.send('app:quit'),
})

// Type definitions for TypeScript
export interface ElectronAPI {
  dismissAlert: (alertId: string) => void
  snoozeAlert: (alertId: string, minutes: number) => void
  joinMeeting: (alertId: string, meetingUrl: string) => void
  onAlertShow: (callback: (data: any) => void) => void
  onAlertUpdate: (callback: (data: any) => void) => void
  getEvents: () => Promise<any[]>
  getSettings: () => Promise<any>
  updateSettings: (settings: any) => Promise<void>
  connectGoogle: () => Promise<any>
  disconnectCalendar: (provider: string) => Promise<void>
  syncCalendars: () => Promise<void>
  getStatistics: (period: string) => Promise<any>
  showMainWindow: () => void
  quitApp: () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
