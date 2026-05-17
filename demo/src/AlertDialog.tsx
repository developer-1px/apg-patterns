import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import type { PatternData } from '../../src'
import { initialAlertDialogData } from './alertdialogData'

export interface AlertDialogProps {
  data?: PatternData
  onConfirm?: () => void
  onCancel?: () => void
}

const titleId = 'alertdialog-title'
const descId = 'alertdialog-desc'

export function AlertDialog({ data = initialAlertDialogData, onConfirm, onCancel }: AlertDialogProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) confirmRef.current?.focus()
    else triggerRef.current?.focus()
  }, [open])

  const close = () => setOpen(false)

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel?.()
      close()
      return
    }
    if (event.key === 'Tab') {
      const focusables = [confirmRef.current, cancelRef.current].filter(Boolean) as HTMLButtonElement[]
      if (focusables.length === 0) return
      const first = focusables[0]!
      const last = focusables[focusables.length - 1]!
      const active = document.activeElement as HTMLElement | null
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  const stopOverlay = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      // overlay click does NOT close per APG alertdialog (modal demands explicit choice)
      event.preventDefault()
    }
  }
  const labelOf = (key: string) => data.items[key]?.label ?? key

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {labelOf('trigger')}
      </button>
      {open ? (
        <div
          data-testid="alertdialog-overlay"
          onClick={stopOverlay}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)' }}
        >
          <div
            ref={panelRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            onKeyDown={handleKeyDown}
          >
            <h2 id={titleId}>{labelOf('title')}</h2>
            <p id={descId}>{labelOf('description')}</p>
            <div>
              <button
                ref={confirmRef}
                type="button"
                onClick={() => {
                  onConfirm?.()
                  close()
                }}
              >
                {labelOf('confirm')}
              </button>
              <button
                ref={cancelRef}
                type="button"
                onClick={() => {
                  onCancel?.()
                  close()
                }}
              >
                {labelOf('cancel')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
