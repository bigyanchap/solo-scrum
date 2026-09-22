import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import type { Project } from '@shared/types'

export type ProjectFilterValue = 'all' | string[]

interface ProjectFilterProps {
  projects: Project[]
  value: ProjectFilterValue
  onChange: (value: ProjectFilterValue) => void
}

function isAllSelected(value: ProjectFilterValue, projectIds: string[]): boolean {
  if (value === 'all') return true
  return projectIds.length > 0 && projectIds.every((id) => value.includes(id))
}

function isProjectSelected(value: ProjectFilterValue, projectId: string): boolean {
  if (value === 'all') return true
  return value.includes(projectId)
}

export function ProjectFilter({ projects, value, onChange }: ProjectFilterProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const projectIds = useMemo(() => projects.map((project) => project.id), [projects])
  const allSelected = isAllSelected(value, projectIds)
  const selectedCount = allSelected
    ? projects.length
    : value === 'all'
      ? projects.length
      : value.filter((id) => projectIds.includes(id)).length

  const label =
    projects.length === 0
      ? 'No projects'
      : allSelected
        ? 'All projects'
        : selectedCount === 0
          ? 'No projects'
          : selectedCount === 1
            ? (projects.find((project) => isProjectSelected(value, project.id))?.name ??
              '1 project')
            : `${selectedCount} projects`

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [open])

  const toggleAll = (): void => {
    onChange(allSelected ? [] : 'all')
  }

  const toggleProject = (projectId: string): void => {
    if (allSelected) {
      onChange(projectIds.filter((id) => id !== projectId))
      return
    }
    const current = value === 'all' ? projectIds : value
    const next = current.includes(projectId)
      ? current.filter((id) => id !== projectId)
      : [...current, projectId]
    onChange(next.length === projectIds.length && projectIds.length > 0 ? 'all' : next)
  }

  return (
    <div className="project-filter" ref={rootRef}>
      <button
        type="button"
        className="ghost-btn header-cta project-filter-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Projects"
        disabled={projects.length === 0}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="project-filter-value">{label}</span>
        <ChevronIcon />
      </button>
      {open ? (
        <div className="project-filter-menu glass-panel" role="listbox" aria-label="Filter by project">
          <label className="project-filter-option">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            <span>All</span>
          </label>
          {projects.length === 0 ? (
            <p className="project-filter-empty">Create a project to filter the board.</p>
          ) : (
            projects.map((project) => (
              <label key={project.id} className="project-filter-option">
                <input
                  type="checkbox"
                  checked={isProjectSelected(value, project.id)}
                  onChange={() => toggleProject(project.id)}
                />
                <span>{project.name}</span>
              </label>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}

function ChevronIcon(): JSX.Element {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M3 4.5 6 7.5 9 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function filterStoriesByProjects<T extends { projectId: string | null }>(
  stories: T[],
  filter: ProjectFilterValue,
  knownProjectIds?: string[]
): T[] {
  if (filter === 'all') return stories
  const allowedIds =
    knownProjectIds === undefined
      ? filter
      : filter.filter((id) => knownProjectIds.includes(id))
  if (allowedIds.length === 0) return []
  const allowed = new Set(allowedIds)
  return stories.filter((story) => story.projectId !== null && allowed.has(story.projectId))
}
