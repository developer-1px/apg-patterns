import { fireEvent, render, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useControlledAlertDialogPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { AlertDialogDemo } from './testing/AlertDialogTestHost'

const triggerlessAlertDialogData: PatternData = {
  items: {
    dialog: { label: 'Delete sheet?' },
    title: { label: 'Delete sheet?' },
    description: { label: 'This cannot be undone.' },
    confirm: { label: 'Delete' },
    cancel: { label: 'Cancel' },
  },
  relations: {
    ownerByKey: { dialog: 'title' },
    controlsByKey: { dialog: ['description'] },
  },
  refs: {
    initialFocusKey: 'confirm',
  },
}

function TriggerlessAlertDialogFixture({
  onEvent,
  onOpenChange,
}: {
  onEvent?: (event: PatternEvent) => void
  onOpenChange?: (open: boolean, meta: { reason: string; key?: string }) => void
}) {
  const openerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(true)
  const alertDialog = useControlledAlertDialogPattern(triggerlessAlertDialogData, {
    open,
    onEvent,
    onOpenChange: (nextOpen, meta) => {
      onOpenChange?.(nextOpen, meta)
      setOpen(nextOpen)
    },
    restoreFocusTo: openerRef,
  })

  return (
    <div>
      <button ref={openerRef} type="button" onClick={() => setOpen(true)}>Open controlled alertdialog</button>
      {alertDialog.open ? (
        <div {...alertDialog.overlayProps}>
          <div {...alertDialog.dialogProps}>
            <h2 {...alertDialog.titleProps}>{alertDialog.labelOf('title')}</h2>
            <p {...alertDialog.descriptionProps}>{alertDialog.labelOf('description')}</p>
            <button {...alertDialog.confirmProps} type="button">{alertDialog.labelOf('confirm')}</button>
            <button {...alertDialog.cancelProps} type="button">{alertDialog.labelOf('cancel')}</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

describe('AlertDialog demo', () => {
  it('does not move focus to the trigger before the alertdialog opens', () => {
    render(<AlertDialogDemo />)
    const trigger = screen.getByRole('button', { name: 'Discard draft' })
    expect(document.activeElement).not.toBe(trigger)
  })

  it('trigger click opens alertdialog with aria-modal and focuses confirm', () => {
    render(<AlertDialogDemo />)
    const trigger = screen.getByRole('button', { name: 'Discard draft' })
    expect(screen.queryByRole('alertdialog')).toBeNull()

    fireEvent.click(trigger)
    const dialog = screen.getByRole('alertdialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy()
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy()

    const confirm = screen.getByRole('button', { name: 'Discard' })
    expect(document.activeElement).toBe(confirm)
  })

  it('Escape closes the dialog and returns focus to trigger', () => {
    const onEvent = vi.fn()
    render(<AlertDialogDemo onEvent={onEvent} />)
    const trigger = screen.getByRole('button', { name: 'Discard draft' })
    fireEvent.click(trigger)

    const dialog = screen.getByRole('alertdialog')
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })

    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(onEvent).toHaveBeenCalledWith({ type: 'activate', key: 'cancel' })
    expect(document.activeElement).toBe(trigger)
  })

  it('confirm click emits confirm and closes', () => {
    const onEvent = vi.fn()
    render(<AlertDialogDemo onEvent={onEvent} />)
    fireEvent.click(screen.getByRole('button', { name: 'Discard draft' }))
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }))
    expect(onEvent).toHaveBeenCalledWith({ type: 'activate', key: 'confirm' })
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('cancel click emits cancel and closes', () => {
    const onEvent = vi.fn()
    render(<AlertDialogDemo onEvent={onEvent} />)
    fireEvent.click(screen.getByRole('button', { name: 'Discard draft' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onEvent).toHaveBeenCalledWith({ type: 'activate', key: 'cancel' })
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('supports triggerless controlled open state with initial focus and restore target', () => {
    const events: PatternEvent[] = []
    const openChanges: Array<{ open: boolean; meta: { reason: string; key?: string } }> = []
    render(
      <TriggerlessAlertDialogFixture
        onEvent={(event) => events.push(event)}
        onOpenChange={(open, meta) => openChanges.push({ open, meta })}
      />,
    )

    const opener = screen.getByRole('button', { name: 'Open controlled alertdialog' })
    expect(opener.getAttribute('aria-expanded')).toBeNull()

    const dialog = screen.getByRole('alertdialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy()
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Delete' }))

    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(document.activeElement).toBe(opener)
    expect(openChanges).toContainEqual({ open: false, meta: { reason: 'keyboard', key: 'dialog' } })
    expect(events).toContainEqual({ type: 'activate', key: 'cancel', meta: { reason: 'keyboard' } })
    expect(events).toContainEqual({ type: 'dismiss', key: 'dialog', meta: { reason: 'keyboard' } })
  })
})
