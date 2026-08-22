import { useEffect, useState, type JSX } from 'react'
import {
  COLUMN_IDS,
  COLUMN_META,
  type ColumnId,
  type Priority,
  type Story,
  type StoryPoints
} from '@shared/types'
import { useBoardStore, type StoryDraft } from '../store/boardStore'

const POINT_OPTIONS: Array<StoryPoints | null> = [null, 1, 2, 3, 5, 8, 13]
const PRIORITIES: Priority[] = ['low', 'medium', 'high']

interface StoryModalProps {
  story: Story | null
  defaultColumn: ColumnId
  onClose: () => void
  onSave: (draft: StoryDraft) => void
}

export function StoryModal({
  story,
  defaultColumn,
  onClose,
  onSave
}: StoryModalProps): JSX.Element {
  const projects = useBoardStore((state) => state.projects)
  const createProject = useBoardStore((state) => state.createProject)
  const [title, setTitle] = useState(story?.title ?? '')
  const [description, setDescription] = useState(story?.description ?? '')
  const [points, setPoints] = useState<StoryPoints | null>(story?.points ?? null)
  const [priority, setPriority] = useState<Priority>(story?.priority ?? 'medium')
  const [column, setColumn] = useState<ColumnId>(story?.column ?? defaultColumn)
  const [projectId, setProjectId] = useState<string | null>(
    story?.projectId ?? projects.at(-1)?.id ?? null
  )
  const [newProject, setNewProject] = useState('')
  const [projectError, setProjectError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const addProject = (): void => {
    const created = createProject(newProject)
    if (!created) {
      setProjectError(newProject.trim() ? 'That project already exists.' : 'Give the project a name.')
      return
    }
    setProjectId(created.id)
    setNewProject('')
    setProjectError(null)
  }

  const canSave = title.trim().length > 0 && Boolean(projectId)

  return (
    <div className="modal-root" onMouseDown={onClose}>
      <form
        className="modal glass-panel"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault()
          if (!canSave) return
          onSave({ title, description, points, priority, column, projectId })
        }}
      >
        <header className="modal-head">
          <div>
            <p className="eyebrow">{story ? story.id : 'New story'}</p>
            <h2>{story ? 'Edit story' : 'Create story'}</h2>
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>

        <label className="field">
          <span>Title</span>
          <input
            autoFocus
            value={title}
            placeholder="What needs to get done?"
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Description and acceptance criteria</span>
          <textarea
            rows={4}
            value={description}
            placeholder="Acceptance notes, context, or nothing at all."
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <div className="field">
          <span>Project</span>
          {projects.length > 0 ? (
            <div className="chip-row wrap">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`choice ${projectId === project.id ? 'is-on' : ''}`}
                  onClick={() => setProjectId(project.id)}
                >
                  {project.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="field-hint">Create a project first, then this story can belong to it.</p>
          )}
          <div className="inline-create">
            <input
              value={newProject}
              placeholder="Or create a project…"
              onChange={(event) => {
                setNewProject(event.target.value)
                setProjectError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addProject()
                }
              }}
            />
            <button type="button" className="ghost-btn" onClick={addProject} disabled={!newProject.trim()}>
              Add
            </button>
          </div>
          {projectError ? <p className="field-error">{projectError}</p> : null}
        </div>

        <div className="field-row">
          <div className="field">
            <span>Priority</span>
            <div className="chip-row">
              {PRIORITIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`choice ${priority === value ? 'is-on' : ''} p-${value}`}
                  onClick={() => setPriority(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span>Points</span>
            <div className="chip-row">
              {POINT_OPTIONS.map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  className={`choice ${points === value ? 'is-on' : ''}`}
                  onClick={() => setPoints(value)}
                >
                  {value ?? '—'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="field">
          <span>Column</span>
          <div className="chip-row wrap">
            {COLUMN_IDS.map((id) => (
              <button
                key={id}
                type="button"
                className={`choice ${column === id ? 'is-on' : ''}`}
                onClick={() => setColumn(id)}
              >
                {COLUMN_META[id].label}
              </button>
            ))}
          </div>
        </div>

        <footer className="modal-actions">
          <button type="button" className="ghost-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-btn" disabled={!canSave}>
            {story ? 'Save changes' : 'Create story'}
          </button>
        </footer>
      </form>
    </div>
  )
}

function CloseIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
