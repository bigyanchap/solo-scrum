import { useEffect, useState, type JSX } from 'react'
import type { ColumnId, Story } from '@shared/types'
import { Header } from './components/Header'
import logo from './assets/logo.png'
import { Board } from './components/Board'
import { StoryModal } from './components/StoryModal'
import { ProjectsModal } from './components/ProjectsModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { useBoardStore, type StoryDraft } from './store/boardStore'

interface Composer {
  story: Story | null
  column: ColumnId
}

export default function App(): JSX.Element {
  const hydrate = useBoardStore((state) => state.hydrate)
  const hydrated = useBoardStore((state) => state.hydrated)
  const stories = useBoardStore((state) => state.stories)
  const projects = useBoardStore((state) => state.projects)
  const createStory = useBoardStore((state) => state.createStory)
  const updateStory = useBoardStore((state) => state.updateStory)
  const deleteStory = useBoardStore((state) => state.deleteStory)
  const [composer, setComposer] = useState<Composer | null>(null)
  const [projectsOpen, setProjectsOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Story | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  const isMac = window.solo?.platform === 'darwin'
  const done = stories.filter((story) => story.column === 'done').length

  const openNew = (column: ColumnId = 'new'): void => {
    setComposer({ story: null, column })
  }

  const saveStory = (draft: StoryDraft): void => {
    if (composer?.story) {
      updateStory(composer.story.id, draft)
    } else {
      createStory(draft)
    }
    setComposer(null)
  }

  const exportPdf = async (): Promise<void> => {
    if (!window.solo?.exportPdf || exporting) return
    setExporting(true)
    setExportError(null)
    try {
      const result = await window.solo.exportPdf({
        stories,
        projects,
        nextNumber: 0,
        nextProjectNumber: 0
      })
      if (result.status === 'error') {
        setExportError(result.message)
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Could not export the PDF.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className={`app ${isMac ? 'is-mac' : ''}`}>
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
      <Header
        isMac={isMac}
        total={stories.length}
        done={done}
        projects={projects.length}
        onNewStory={() => openNew('new')}
        onProjects={() => setProjectsOpen(true)}
        onExport={() => void exportPdf()}
        exporting={exporting}
      />
      <main className="workspace">
        {hydrated ? (
          <Board
            onNewStory={openNew}
            onEdit={(story) => setComposer({ story, column: story.column })}
            onDelete={setPendingDelete}
          />
        ) : (
          <div className="loading glass-panel">
            <img className="mark" src={logo} alt="" width={56} height={56} />
            <p>Loading board…</p>
          </div>
        )}
      </main>
      {projectsOpen ? <ProjectsModal onClose={() => setProjectsOpen(false)} /> : null}
      {composer ? (
        <StoryModal
          story={composer.story}
          defaultColumn={composer.column}
          onClose={() => setComposer(null)}
          onSave={saveStory}
        />
      ) : null}
      {pendingDelete ? (
        <ConfirmDialog
          title="Delete story"
          message={`Are you sure you want to delete ${pendingDelete.id} · ${pendingDelete.title}? This cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            deleteStory(pendingDelete.id)
            setPendingDelete(null)
          }}
        />
      ) : null}
      {exportError ? (
        <ConfirmDialog
          title="Export failed"
          message={exportError}
          confirmLabel="OK"
          hideCancel
          danger={false}
          onCancel={() => setExportError(null)}
          onConfirm={() => setExportError(null)}
        />
      ) : null}
    </div>
  )
}
