import type { JSX } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { COLUMN_META, type ColumnId, type Story } from '@shared/types'
import { StoryCard } from './StoryCard'

interface ColumnProps {
  column: ColumnId
  stories: Story[]
  onNewStory: (column: ColumnId) => void
  onEdit: (story: Story) => void
  onDelete: (story: Story) => void
  onMove: (story: Story, column: ColumnId) => void
}

export function Column({
  column,
  stories,
  onNewStory,
  onEdit,
  onDelete,
  onMove
}: ColumnProps): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({ id: column })
  const meta = COLUMN_META[column]

  return (
    <section className={`column glass-panel ${isOver ? 'is-over' : ''}`}>
      <header className="column-head">
        <div className="column-title">
          <span className="accent" style={{ background: meta.accent }} />
          <div>
            <h2>{meta.label}</h2>
            <p>{meta.hint}</p>
          </div>
        </div>
        <div className="column-tools">
          <span className="count">{stories.length}</span>
          <button
            type="button"
            className="icon-btn"
            aria-label={`Add story to ${meta.label}`}
            onClick={() => onNewStory(column)}
          >
            <PlusIcon />
          </button>
        </div>
      </header>
      <div ref={setNodeRef} className="column-body">
        <SortableContext items={stories.map((story) => story.id)} strategy={verticalListSortingStrategy}>
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </SortableContext>
        {stories.length === 0 ? (
          <div className="empty-col">
            <p>Drop a story here</p>
            <button type="button" className="text-btn" onClick={() => onNewStory(column)}>
              or create one
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function PlusIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
