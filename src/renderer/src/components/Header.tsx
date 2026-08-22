import type { JSX } from 'react'
import logo from '../assets/logo.png'

interface HeaderProps {
  isMac: boolean
  total: number
  done: number
  projects: number
  exporting: boolean
  onNewStory: () => void
  onProjects: () => void
  onExport: () => void
}

export function Header({
  isMac,
  total,
  done,
  projects,
  exporting,
  onNewStory,
  onProjects,
  onExport
}: HeaderProps): JSX.Element {
  return (
    <header className={`app-header ${isMac ? 'is-mac' : ''}`}>
      <div className="brand">
        <img className="mark" src={logo} alt="" width={44} height={44} />
        <div className="brand-copy">
          <h1>Solo Scrum</h1>
          <p>Local board for one developer</p>
        </div>
      </div>
      <div className="header-meta">
        <button type="button" className="stat glass-chip stat-btn" onClick={onProjects}>
          <span className="stat-value">{projects}</span>
          <span className="stat-label">projects</span>
        </button>
        <div className="stat glass-chip">
          <span className="stat-value">{total}</span>
          <span className="stat-label">stories</span>
        </div>
        <div className="stat glass-chip">
          <span className="stat-value">{done}</span>
          <span className="stat-label">done</span>
        </div>
        <button type="button" className="ghost-btn header-cta" onClick={onExport} disabled={exporting}>
          {exporting ? 'Exporting…' : 'Export PDF'}
        </button>
        <button type="button" className="ghost-btn header-cta" onClick={onProjects}>
          New project
        </button>
        <button type="button" className="primary-btn header-cta" onClick={onNewStory}>
          New story
        </button>
      </div>
    </header>
  )
}
