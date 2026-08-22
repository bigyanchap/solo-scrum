import { useEffect, type JSX } from 'react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  hideCancel?: boolean
  danger?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  hideCancel = false,
  danger = true,
  onCancel,
  onConfirm
}: ConfirmDialogProps): JSX.Element {
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="modal-root"
      onMouseDown={(event) => {
        event.stopPropagation()
        onCancel()
      }}
    >
      <div className="modal compact glass-panel" onMouseDown={(event) => event.stopPropagation()}>
        <h2>{title}</h2>
        <p className="confirm-copy">{message}</p>
        <footer className="modal-actions">
          {hideCancel ? null : (
            <button type="button" className="ghost-btn" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="button" className={danger ? 'danger-btn' : 'primary-btn'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  )
}
