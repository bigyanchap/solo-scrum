import type { BoardData, ExportPdfResult } from '@shared/types'

export interface SoloApi {
  platform: NodeJS.Platform
  loadBoard: () => Promise<BoardData>
  saveBoard: (data: BoardData) => Promise<void>
  exportPdf: (data: BoardData) => Promise<ExportPdfResult>
}

declare global {
  interface Window {
    solo: SoloApi
  }
}

export {}
