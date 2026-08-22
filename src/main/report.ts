import { BrowserWindow, dialog, shell } from 'electron'
import { readFile, unlink, writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { normalizeBoard, type BoardData, type ExportPdfResult } from '@shared/types'
import { buildBoardReportHtml } from '@shared/reportHtml'
import logo from '../../resources/logo.png?asset'

async function logoDataUri(): Promise<string> {
  const bytes = await readFile(logo)
  return `data:image/png;base64,${bytes.toString('base64')}`
}

export async function exportBoardPdf(
  sender: Electron.WebContents,
  data: BoardData
): Promise<ExportPdfResult> {
  const parent = BrowserWindow.fromWebContents(sender)
  const stamp = new Date().toISOString().slice(0, 10)
  const options: Electron.SaveDialogOptions = {
    title: 'Export board report',
    defaultPath: `Solo-Scrum-Board-${stamp}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  }
  const choice = parent
    ? await dialog.showSaveDialog(parent, options)
    : await dialog.showSaveDialog(options)

  if (choice.canceled || !choice.filePath) {
    return { status: 'canceled' }
  }

  const report = new BrowserWindow({
    show: false,
    width: 1400,
    height: 900,
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const tempHtml = join(tmpdir(), `solo-scrum-report-${Date.now()}.html`)

  try {
    const html = buildBoardReportHtml(normalizeBoard(data), new Date(), await logoDataUri())
    await writeFile(tempHtml, html, 'utf8')
    await report.loadFile(tempHtml)
    const pdf = await report.webContents.printToPDF({
      printBackground: true,
      landscape: true,
      pageSize: 'Letter',
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate:
        '<div style="font-size:9px;width:100%;padding:0 24px;color:#667085;display:flex;justify-content:space-between;"><span>Solo Scrum board report</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'
    })
    await writeFile(choice.filePath, pdf)
    shell.showItemInFolder(choice.filePath)
    return { status: 'saved', path: choice.filePath }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not export the PDF.'
    return { status: 'error', message }
  } finally {
    if (!report.isDestroyed()) {
      report.destroy()
    }
    void unlink(tempHtml).catch(() => undefined)
  }
}
