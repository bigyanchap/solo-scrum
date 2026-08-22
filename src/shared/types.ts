export const COLUMN_IDS = ['new', 'progress', 'tested', 'done'] as const

export type ColumnId = (typeof COLUMN_IDS)[number]

export type Priority = 'low' | 'medium' | 'high'

export type StoryPoints = 1 | 2 | 3 | 5 | 8 | 13

export interface Project {
  id: string
  name: string
  createdAt: number
}

export interface Story {
  id: string
  title: string
  description: string
  points: StoryPoints | null
  priority: Priority
  column: ColumnId
  projectId: string | null
  order: number
  createdAt: number
}

export interface BoardData {
  stories: Story[]
  projects: Project[]
  nextNumber: number
  nextProjectNumber: number
}

export type ExportPdfResult =
  | { status: 'canceled' }
  | { status: 'saved'; path: string }
  | { status: 'error'; message: string }

export const COLUMN_META: Record<
  ColumnId,
  { label: string; hint: string; accent: string }
> = {
  new: {
    label: 'New',
    hint: 'Backlog',
    accent: '#3b82f6'
  },
  progress: {
    label: 'On Progress',
    hint: 'Active work',
    accent: '#f59e0b'
  },
  tested: {
    label: 'Tested',
    hint: 'Verified',
    accent: '#8b5cf6'
  },
  done: {
    label: 'Done',
    hint: 'Shipped',
    accent: '#10b981'
  }
}

export function isColumnId(value: unknown): value is ColumnId {
  return typeof value === 'string' && (COLUMN_IDS as readonly string[]).includes(value)
}

export function createEmptyBoard(): BoardData {
  return {
    stories: [],
    projects: [],
    nextNumber: 1,
    nextProjectNumber: 1
  }
}

export function normalizeBoard(data: Partial<BoardData> | null | undefined): BoardData {
  const empty = createEmptyBoard()
  if (!data || !Array.isArray(data.stories) || typeof data.nextNumber !== 'number') {
    return empty
  }

  return {
    stories: data.stories.map((story) => ({
      ...story,
      projectId: story.projectId ?? null
    })),
    projects: Array.isArray(data.projects) ? data.projects : [],
    nextNumber: data.nextNumber,
    nextProjectNumber:
      typeof data.nextProjectNumber === 'number' ? data.nextProjectNumber : 1
  }
}
