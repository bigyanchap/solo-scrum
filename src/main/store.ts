import { app } from 'electron'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import { normalizeBoard, type BoardData } from '@shared/types'

function boardPath(): string {
  return join(app.getPath('userData'), 'solo-scrum.json')
}

export async function loadBoard(): Promise<BoardData> {
  try {
    const raw = await readFile(boardPath(), 'utf8')
    const parsed = JSON.parse(raw) as Partial<BoardData>
    return normalizeBoard(parsed)
  } catch {
    return normalizeBoard(null)
  }
}

export async function saveBoard(data: BoardData): Promise<void> {
  const file = boardPath()
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(data, null, 2), 'utf8')
}
