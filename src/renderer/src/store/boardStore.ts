import { create } from 'zustand'
import {
  createEmptyBoard,
  normalizeBoard,
  type BoardData,
  type ColumnId,
  type Priority,
  type Project,
  type Story,
  type StoryPoints
} from '@shared/types'

export interface StoryDraft {
  title: string
  description: string
  points: StoryPoints | null
  priority: Priority
  column: ColumnId
  projectId: string | null
}

interface BoardState extends BoardData {
  hydrated: boolean
  hydrate: () => Promise<void>
  createProject: (name: string) => Project | null
  renameProject: (id: string, name: string) => void
  deleteProject: (id: string) => void
  createStory: (draft: StoryDraft) => Story
  updateStory: (id: string, draft: StoryDraft) => void
  deleteStory: (id: string) => void
  moveStory: (id: string, column: ColumnId, index: number) => void
}

function persist(state: BoardData): void {
  void window.solo?.saveBoard({
    stories: state.stories,
    projects: state.projects,
    nextNumber: state.nextNumber,
    nextProjectNumber: state.nextProjectNumber
  })
}

function storiesInColumn(stories: Story[], column: ColumnId, exceptId?: string): Story[] {
  return stories
    .filter((story) => story.column === column && story.id !== exceptId)
    .sort((a, b) => a.order - b.order)
}

function reindex(stories: Story[], column: ColumnId): Story[] {
  const ordered = storiesInColumn(stories, column)
  const orderById = new Map(ordered.map((story, index) => [story.id, index]))
  return stories.map((story) =>
    story.column === column ? { ...story, order: orderById.get(story.id) ?? story.order } : story
  )
}

export const useBoardStore = create<BoardState>((set, get) => ({
  ...createEmptyBoard(),
  hydrated: false,

  hydrate: async () => {
    if (!window.solo) {
      set({ hydrated: true })
      return
    }
    const data = normalizeBoard(await window.solo.loadBoard())
    set({ ...data, hydrated: true })
  },

  createProject: (name) => {
    const trimmed = name.trim()
    if (!trimmed) return null
    const exists = get().projects.some(
      (project) => project.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (exists) return null
    const { nextProjectNumber, projects } = get()
    const project: Project = {
      id: `PRJ-${nextProjectNumber}`,
      name: trimmed,
      createdAt: Date.now()
    }
    set({
      projects: [...projects, project],
      nextProjectNumber: nextProjectNumber + 1
    })
    persist(get())
    return project
  },

  renameProject: (id, name) => {
    const trimmed = name.trim()
    if (!trimmed) return
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, name: trimmed } : project
      )
    }))
    persist(get())
  },

  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      stories: state.stories.map((story) =>
        story.projectId === id ? { ...story, projectId: null } : story
      )
    }))
    persist(get())
  },

  createStory: (draft) => {
    const { nextNumber, stories } = get()
    const story: Story = {
      id: `US-${nextNumber}`,
      title: draft.title.trim(),
      description: draft.description.trim(),
      points: draft.points,
      priority: draft.priority,
      column: draft.column,
      projectId: draft.projectId,
      order: 0,
      createdAt: Date.now()
    }
    const shifted = stories.map((item) =>
      item.column === draft.column ? { ...item, order: item.order + 1 } : item
    )
    const next = {
      stories: reindex([story, ...shifted], draft.column),
      nextNumber: nextNumber + 1
    }
    set(next)
    persist(get())
    return story
  },

  updateStory: (id, draft) => {
    const current = get().stories.find((story) => story.id === id)
    if (!current) return
    if (current.column !== draft.column) {
      get().moveStory(id, draft.column, 0)
    }
    set((state) => ({
      stories: state.stories.map((story) =>
        story.id === id
          ? {
              ...story,
              title: draft.title.trim(),
              description: draft.description.trim(),
              points: draft.points,
              priority: draft.priority,
              projectId: draft.projectId
            }
          : story
      )
    }))
    persist(get())
  },

  deleteStory: (id) => {
    const story = get().stories.find((item) => item.id === id)
    if (!story) return
    set((state) => ({
      stories: reindex(
        state.stories.filter((item) => item.id !== id),
        story.column
      )
    }))
    persist(get())
  },

  moveStory: (id, column, index) => {
    const current = get().stories.find((story) => story.id === id)
    if (!current) return

    const without = get().stories.filter((story) => story.id !== id)
    const target = storiesInColumn(without, column)
    const clamped = Math.max(0, Math.min(index, target.length))
    const moved: Story = { ...current, column, order: clamped }
    const rebuilt = [
      ...without.filter((story) => story.column !== column),
      ...target.slice(0, clamped),
      moved,
      ...target.slice(clamped)
    ]
    const nextStories = reindex(
      column === current.column ? rebuilt : reindex(rebuilt, current.column),
      column
    )
    set({ stories: nextStories })
    persist(get())
  }
}))

export function getStoriesByColumn(stories: Story[], column: ColumnId): Story[] {
  return storiesInColumn(stories, column)
}

export function getProjectName(projects: Project[], projectId: string | null): string | null {
  if (!projectId) return null
  return projects.find((project) => project.id === projectId)?.name ?? null
}
