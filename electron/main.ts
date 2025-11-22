import { app, BrowserWindow, ipcMain, Tray, Menu, screen } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { DatabaseManager } from './database/DatabaseManager'
import { AlertScheduler } from './services/AlertScheduler'
import { CalendarSync } from './services/CalendarSync'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class FullScreenAlertApp {
  private mainWindow: BrowserWindow | null = null
  private alertWindow: BrowserWindow | null = null
  private tray: Tray | null = null
  private dbManager: DatabaseManager
  private alertScheduler: AlertScheduler
  private calendarSync: CalendarSync

  constructor() {
    this.dbManager = new DatabaseManager()
    this.alertScheduler = new AlertScheduler(this.dbManager)
    this.calendarSync = new CalendarSync(this.dbManager)
  }

  async initialize() {
    await app.whenReady()

    // Initialize database
    this.dbManager.initialize()

    // Create system tray
    this.createTray()

    // Don't create main window by default (menu bar app)
    // this.createMainWindow()

    // Start alert scheduler
    this.alertScheduler.start()

    // Start calendar sync
    this.calendarSync.startSync()

    // Set up IPC handlers
    this.setupIpcHandlers()
  }

  private createTray() {
    // Use a simple icon for now (you'll need to add actual icons later)
    const iconPath = path.join(__dirname, '../assets/tray-icon.png')
    this.tray = new Tray(iconPath)

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Dashboard',
        click: () => this.createMainWindow()
      },
      { type: 'separator' },
      {
        label: 'Upcoming Events',
        submenu: [
          { label: 'Loading...', enabled: false }
        ]
      },
      { type: 'separator' },
      {
        label: 'Enable Alerts',
        type: 'checkbox',
        checked: true,
        click: (menuItem) => {
          this.alertScheduler.setEnabled(menuItem.checked)
        }
      },
      { type: 'separator' },
      {
        label: 'Settings',
        click: () => this.createMainWindow()
      },
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ])

    this.tray.setToolTip('FullScreen Alert')
    this.tray.setContextMenu(contextMenu)

    // Double-click to open dashboard
    this.tray.on('double-click', () => {
      this.createMainWindow()
    })
  }

  private createMainWindow() {
    if (this.mainWindow) {
      this.mainWindow.focus()
      return
    }

    this.mainWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      minWidth: 800,
      minHeight: 600,
      title: 'FullScreen Alert',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
      titleBarStyle: 'hiddenInset',
      backgroundColor: '#ffffff'
    })

    // Load the app
    if (process.env.VITE_DEV_SERVER_URL) {
      this.mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
      this.mainWindow.webContents.openDevTools()
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null
    })
  }

  createAlertWindow(alertData: any) {
    if (this.alertWindow) {
      // Update existing alert
      this.alertWindow.webContents.send('alert:update', alertData)
      this.alertWindow.focus()
      return
    }

    // Get primary display bounds
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.bounds

    this.alertWindow = new BrowserWindow({
      width,
      height,
      x: primaryDisplay.bounds.x,
      y: primaryDisplay.bounds.y,
      fullscreen: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      frame: false,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      closable: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
      backgroundColor: '#000000'
    })

    // Load alert page
    if (process.env.VITE_DEV_SERVER_URL) {
      this.alertWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/alert`)
    } else {
      this.alertWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
        hash: '/alert'
      })
    }

    // Send alert data once loaded
    this.alertWindow.webContents.on('did-finish-load', () => {
      this.alertWindow?.webContents.send('alert:show', alertData)
    })

    this.alertWindow.on('closed', () => {
      this.alertWindow = null
    })

    // Prevent window from being closed by escape key accidentally
    this.alertWindow.on('close', (event) => {
      // Allow close only if explicitly triggered
    })
  }

  private setupIpcHandlers() {
    // Alert actions
    ipcMain.on('alert:dismiss', (event, alertId) => {
      this.alertScheduler.dismissAlert(alertId)
      this.alertWindow?.close()
    })

    ipcMain.on('alert:snooze', (event, { alertId, minutes }) => {
      this.alertScheduler.snoozeAlert(alertId, minutes)
      this.alertWindow?.close()
    })

    ipcMain.on('alert:join-meeting', (event, { alertId, meetingUrl }) => {
      this.alertScheduler.joinMeeting(alertId, meetingUrl)
      // Open URL in default browser
      require('electron').shell.openExternal(meetingUrl)
      this.alertWindow?.close()
    })

    // Database queries
    ipcMain.handle('db:get-events', async () => {
      return this.dbManager.getUpcomingEvents()
    })

    ipcMain.handle('db:get-settings', async () => {
      return this.dbManager.getSettings()
    })

    ipcMain.handle('db:update-settings', async (event, settings) => {
      return this.dbManager.updateSettings(settings)
    })

    // Calendar operations
    ipcMain.handle('calendar:connect-google', async () => {
      return this.calendarSync.connectGoogle()
    })

    ipcMain.handle('calendar:disconnect', async (event, provider) => {
      return this.calendarSync.disconnect(provider)
    })

    ipcMain.handle('calendar:sync', async () => {
      return this.calendarSync.syncAll()
    })

    // Statistics
    ipcMain.handle('stats:get', async (event, period) => {
      return this.dbManager.getStatistics(period)
    })

    // App control
    ipcMain.on('app:show-main-window', () => {
      this.createMainWindow()
    })

    ipcMain.on('app:quit', () => {
      app.quit()
    })

    // Trigger alert (for scheduler)
    this.alertScheduler.on('trigger-alert', (alertData) => {
      this.createAlertWindow(alertData)
    })
  }
}

// App lifecycle
const appInstance = new FullScreenAlertApp()

app.on('ready', () => {
  appInstance.initialize()
})

app.on('window-all-closed', () => {
  // Don't quit on macOS when all windows are closed (menu bar app behavior)
  if (process.platform !== 'darwin') {
    // On Windows, keep running in system tray
    // app.quit()
  }
})

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    // Don't auto-create, let user open from tray
  }
})

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance
    // Focus our main window if it exists
  })
}
