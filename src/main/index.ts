import { app, BrowserWindow, ipcMain, nativeImage, shell } from 'electron'
import { join } from 'path'
import { loadBoard, saveBoard } from './store'
import { exportBoardPdf } from './report'
import type { BoardData } from '@shared/types'
import logo from '../../resources/logo.png?asset'

function appIcon(): Electron.NativeImage {
  return nativeImage.createFromPath(logo)
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    title: 'Solo Scrum',
    icon: logo,
    backgroundColor: '#f3f5f9',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 16, y: 18 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.setName('Solo Scrum')

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock?.setIcon(appIcon())
  }

  ipcMain.handle('board:load', () => loadBoard())
  ipcMain.handle('board:save', (_event, data: BoardData) => saveBoard(data))
  ipcMain.handle('report:export', (event, data: BoardData) => exportBoardPdf(event.sender, data))

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
