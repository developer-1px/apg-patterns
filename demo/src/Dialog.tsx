import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import type { PatternData } from '../../src'
import { dialogContent, initialDialogData } from './dialogData'

const triggerClass =
  'inline-flex h-8 items-center rounded bg-zinc-100 px-3 text-sm text-zinc-800 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500'
const overlayClass =
  'fixed inset-0 z-40 bg-black/40'
const panelClass =
  'fixed left-1/2 top-1/2 z-50 w-[28rem] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded bg-white p-5 text-sm text-zinc-800 shadow-lg outline-none dark:bg-zinc-900 dark:text-zinc-200'
const inputClass =
  'h-8 w-full rounded border border-zinc-300 bg-white px-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950'
const buttonClass =
  'inline-flex h-8 items-center rounded bg-zinc-100 px-3 text-sm text-zinc-800 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableIn(root: HTMLElement | null): HTMLElement[] {
  if (!root) return []
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

export interface DialogProps {
  data?: PatternData
}

export function Dialog({ data = initialDialogData }: DialogProps = {}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const titleId = 'dialog-title'
  const descId = 'dialog-description'

  const close = () => setOpen(false)

  useEffect(() => {
    if (open) {
      const first = focusableIn(panelRef.current)[0]
      first?.focus()
      return
    }
    triggerRef.current?.focus()
  }, [open])

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key !== 'Tab') return
    const items = focusableIn(panelRef.current)
    if (items.length === 0) {
      event.preventDefault()
      return
    }
    const first = items[0]!
    const last = items[items.length - 1]!
    const active = document.activeElement as HTMLElement | null
    if (event.shiftKey && active === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const onOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) close()
  }
  const labelOf = (key: string) => data.items[key]?.label ?? key

  return (
    <div className="grid gap-3">
      <button
        ref={triggerRef}
        type="button"
        className={triggerClass}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="dialog-panel"
        onClick={() => setOpen(true)}
      >
        {labelOf('trigger')}
      </button>
      {open ? (
        <>
          <div className={overlayClass} data-testid="dialog-overlay" onMouseDown={onOverlayMouseDown} />
          <div
            ref={panelRef}
            id="dialog-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className={panelClass}
            onKeyDown={onPanelKeyDown}
            tabIndex={-1}
          >
            <h2 id={titleId} className="mb-1 text-base font-medium">{labelOf('title')}</h2>
            <p id={descId} className="mb-4 text-zinc-600 dark:text-zinc-400">{labelOf('description')}</p>
            <div className="grid gap-2">
              {dialogContent.fields.map((field) => (
                <label key={field.id} className="grid grid-cols-[5rem_1fr] items-center gap-2">
                  <span>{field.label}</span>
                  <input id={`dialog-${field.id}`} type="text" className={inputClass} />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className={buttonClass} onClick={close}>{dialogContent.cancelLabel}</button>
              <button type="button" className={buttonClass} onClick={close}>{dialogContent.submitLabel}</button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
