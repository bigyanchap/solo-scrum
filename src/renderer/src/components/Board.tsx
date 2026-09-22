import { useMemo, useState, type JSX } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core'
import { COLUMN_IDS, isColumnId, type ColumnId, type Story } from '@shared/types'
import { getStoriesByColumn, useBoardStore } from '../store/boardStore'
import { Column } from './Column'
import { StoryCard } from './StoryCard'

interface BoardProps {
  stories: Story[]
  onNewStory: (column: ColumnId) => void
  onEdit: (story: Story) => void
  onDelete: (story: Story) => void
}

export function Board({ stories, onNewStory, onEdit, onDelete }: BoardProps): JSX.Element {
  const allStories = useBoardStore((state) => state.stories)
  const moveStory = useBoardStore((state) => state.moveStory)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 }
    })
  )

  const grouped = useMemo(() => {
    return Object.fromEntries(
      COLUMN_IDS.map((column) => [column, getStoriesByColumn(stories, column)])
    ) as Record<ColumnId, Story[]>
  }, [stories])

  const allGrouped = useMemo(() => {
    return Object.fromEntries(
      COLUMN_IDS.map((column) => [column, getStoriesByColumn(allStories, column)])
    ) as Record<ColumnId, Story[]>
  }, [allStories])

  const activeStory =
    stories.find((story) => story.id === activeId) ??
    allStories.find((story) => story.id === activeId) ??
    null

  const handleDragStart = (event: DragStartEvent): void => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const storyId = String(active.id)
    const overId = String(over.id)
    if (storyId === overId) return

    if (isColumnId(overId)) {
      const destination = allGrouped[overId].filter((story) => story.id !== storyId)
      moveStory(storyId, overId, destination.length)
      return
    }

    const overStory = allStories.find((story) => story.id === overId)
    if (!overStory) return
    const destination = allGrouped[overStory.column].filter((story) => story.id !== storyId)
    const index = destination.findIndex((story) => story.id === overStory.id)
    moveStory(storyId, overStory.column, index === -1 ? destination.length : index)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="board">
        {COLUMN_IDS.map((column) => (
          <Column
            key={column}
            column={column}
            stories={grouped[column]}
            onNewStory={onNewStory}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={(story, next) => {
              const destination = allGrouped[next].filter((item) => item.id !== story.id)
              moveStory(story.id, next, destination.length)
            }}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeStory ? (
          <StoryCard
            story={activeStory}
            overlay
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={() => undefined}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
