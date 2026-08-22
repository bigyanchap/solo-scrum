import { useEffect, useState, type JSX } from 'react'
import type { Project } from '@shared/types'
import { useBoardStore } from '../store/boardStore'
import { ConfirmDialog } from './ConfirmDialog'

interface ProjectsModalProps {
  onClose: () => void
}

export function ProjectsModal({ onClose }: ProjectsModalProps): JSX.Element {
  const projects = useBoardStore((state) => state.projects)
  const stories = useBoardStore((state) => state.stories)
  const createProject = useBoardStore((state) => state.createProject)
  const renameProject = useBoardStore((state) => state.renameProject)
  const deleteProject = useBoardStore((state) => state.deleteProject)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && !pendingDelete) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, pendingDelete])

  const addProject = (): void => {
    const created = createProject(name)
    if (!created) {
      setError(name.trim() ? 'That project already exists.' : 'Give the project a name.')
      return
    }
    setName('')
    setError(null)
  }

  return (
    <div className="modal-root" onMouseDown={onClose}>
      <div className="modal glass-panel" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-head">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2>Projects</h2>
          </div>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <CloseIcon />
          </button>
        </header>

        <form
          className="project-create"
          onSubmit={(event) => {
            event.preventDefault()
            addProject()
          }}
        >
          <label className="field">
            <span>New project</span>
            <input
              autoFocus
              value={name}
              placeholder="PersonalDevOps, Website, Notes…"
              onChange={(event) => {
                setName(event.target.value)
                setError(null)
              }}
            />
          </label>
          {error ? <p className="field-error">{error}</p> : null}
          <button type="submit" className="primary-btn" disabled={!name.trim()}>
            Create project
          </button>
        </form>

        <div className="project-list">
          {projects.length === 0 ? (
            <p className="empty-projects">No projects yet. Create one, then attach stories to it.</p>
          ) : (
            projects.map((project) => {
              const count = stories.filter((story) => story.projectId === project.id).length
              return (
                <div key={project.id} className="project-row glass-card">
                  <div className="project-copy">
                    <input
                      className="project-name-input"
                      defaultValue={project.name}
                      aria-label={`Rename ${project.name}`}
                      onBlur={(event) => {
                        const next = event.target.value.trim()
                        if (next && next !== project.name) renameProject(project.id, next)
                        else event.target.value = project.name
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') (event.target as HTMLInputElement).blur()
                      }}
                    />
                    <span>
                      {count} {count === 1 ? 'story' : 'stories'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="ghost-btn danger-text"
                    onClick={() => setPendingDelete(project)}
                  >
                    Delete
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
      {pendingDelete ? (
        <ConfirmDialog
          title="Delete project"
          message={`Are you sure you want to delete “${pendingDelete.name}”? Stories in this project stay on the board, but they will no longer belong to it. This cannot be undone.`}
          confirmLabel="Delete project"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            deleteProject(pendingDelete.id)
            setPendingDelete(null)
          }}
        />
      ) : null}
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
