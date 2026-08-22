import { useEffect, useRef, useState, type JSX } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { COLUMN_META, type ColumnId, type Story } from '@shared/types'
import { getProjectName, useBoardStore } from '../store/boardStore'

interface StoryCardProps {
  story: Story
  overlay?: boolean
  onEdit: (story: Story) => void
  onDelete: (story: Story) => void
  onMove: (story: Story, column: ColumnId) => void
}

export function StoryCard({
  story,
  overlay = false,
  onEdit,
  onDelete,
  onMove
}: StoryCardProps): JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const projects = useBoardStore((state) => state.projects)
  const projectName = getProjectName(projects, story.projectId)
  const sortable = useSortable({ id: story.id, disabled: overlay })

  const style = overlay
    ? undefined
    : {
        transform: CSS.Transform.toString(sortable.transform),
        transition: sortable.transition,
        opacity: sortable.isDragging ? 0.35 : 1
      }

  useEffect(() => {
    if (!menuOpen) return
    const onPointer = (event: MouseEvent): void => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [menuOpen])

  return (
    <article
      ref={overlay ? undefined : sortable.setNodeRef}
      className={`story-card glass-card ${overlay ? 'is-overlay' : ''} ${sortable.isDragging ? 'is-dragging' : ''}`}
      style={style}
      onClick={() => {
        if (!overlay && !sortable.isDragging) onEdit(story)
      }}
      {...(overlay ? {} : sortable.attributes)}
      {...(overlay ? {} : sortable.listeners)}
    >
      <div className="card-top">
        <span className="story-id">{story.id}</span>
        <div className="card-actions" ref={menuRef} onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            className="icon-btn"
            aria-label="Story actions"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              setMenuOpen((open) => !open)
            }}
          >
            <DotsIcon />
          </button>
          {menuOpen ? (
            <div className="card-menu glass-panel">
              <button type="button" onClick={() => onEdit(story)}>
                Edit story
              </button>
              <div className="menu-label">Move to</div>
              {(Object.keys(COLUMN_META) as ColumnId[]).map((column) => (
                <button
                  key={column}
                  type="button"
                  disabled={column === story.column}
                  onClick={() => {
                    onMove(story, column)
                    setMenuOpen(false)
                  }}
                >
                  {COLUMN_META[column].label}
                </button>
              ))}
              <button type="button" className="danger" onClick={() => onDelete(story)}>
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <h3>{story.title}</h3>
      {projectName ? <p className="card-project">from the project <span className="boldify-text">{projectName}</span></p> : null}
      {story.description ? <p className="card-desc">{story.description}</p> : null}
      <footer className="card-meta">
        <span className={`priority p-${story.priority}`}>{story.priority}</span>
        {story.points != null ? <span className="points">{story.points} pts</span> : null}
      </footer>
    </article>
  )
}

function DotsIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="3" r="1.35" />
      <circle cx="8" cy="8" r="1.35" />
      <circle cx="8" cy="13" r="1.35" />
    </svg>
  )
}
