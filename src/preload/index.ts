import { contextBridge, ipcRenderer } from 'electron'
import type { BoardData, ExportPdfResult } from '@shared/types'

const api = {
  platform: process.platform,
  loadBoard: (): Promise<BoardData> => ipcRenderer.invoke('board:load'),
  saveBoard: (data: BoardData): Promise<void> => ipcRenderer.invoke('board:save', data),
  exportPdf: (data: BoardData): Promise<ExportPdfResult> => ipcRenderer.invoke('report:export', data)
}

contextBridge.exposeInMainWorld('solo', api)
