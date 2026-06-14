import { fireEvent, render, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { useControlledDialogPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { DialogDemo } from './testing/DialogTestHost'

const triggerlessDialogData: PatternData = {
  items: {
    dialog: { label: 'Rename sheet' },
    title: { label: 'Rename sheet' },
    description: { label: 'Choose a short sheet name.' },
    cancel: { label: 'Cancel' },
    submit: { label: 'Save' },
  },
  relations: {
    ownerByKey: { dialog: 'title' },
    controlsByKey: { dialog: ['description'] },
  },
}

function TriggerlessDialogFixture({
  onEvent,
  onOpenChange,
}: {
  onEvent?: (event: PatternEvent) => void
  onOpenChange?: (open: boolean, meta: { reason: string; key?: string }) => void
}) {
  const openerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(true)
  const dialog = useControlledDialogPattern(triggerlessDialogData, {
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
      <button ref={openerRef} type="button" onClick={() => setOpen(true)}>Open controlled dialog</button>
      {dialog.open ? (
        <>
          <div {...dialog.overlayProps} data-testid="controlled-dialog-overlay" />
          <div {...dialog.dialogProps}>
            <h2 {...dialog.titleProps}>{dialog.labelOf('title')}</h2>
            <p {...dialog.descriptionProps}>{dialog.labelOf('description')}</p>
            <input aria-label="Sheet name" />
            <button {...dialog.cancelProps} type="button">{dialog.labelOf('cancel')}</button>
            <button {...dialog.submitProps} type="button">{dialog.labelOf('submit')}</button>
          </div>
        </>
      ) : null}
    </div>
  )
}

describe('Dialog demo (modal)', () => {
  it('opens on trigger click with role=dialog and aria-modal=true', () => {
    render(<DialogDemo />)
    const trigger = screen.getByRole('button', { name: /add delivery address/i })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy()
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('does not move focus to the trigger before the dialog opens', () => {
    render(<DialogDemo />)
    const trigger = screen.getByRole('button', { name: /add delivery address/i })
    expect(document.activeElement).not.toBe(trigger)
  })

  it('focuses first interactive element when opened', () => {
    render(<DialogDemo />)
    const trigger = screen.getByRole('button', { name: /add delivery address/i })
    fireEvent.click(trigger)

    const firstInput = document.getElementById('dialog-street') as HTMLInputElement
    expect(document.activeElement).toBe(firstInput)
  })

  it('closes on Escape and returns focus to trigger', () => {
    render(<DialogDemo />)
    const trigger = screen.getByRole('button', { name: /add delivery address/i })
    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on overlay click', () => {
    render(<DialogDemo />)
    const trigger = screen.getByRole('button', { name: /add delivery address/i })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeTruthy()

    const overlay = screen.getByTestId('dialog-overlay')
    fireEvent.mouseDown(overlay)

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('Tab from last focusable wraps to first (focus trap)', () => {
    render(<DialogDemo />)
    const trigger = screen.getByRole('button', { name: /add delivery address/i })
    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog')
    const add = screen.getByRole('button', { name: 'Add' })
    const firstInput = document.getElementById('dialog-street') as HTMLInputElement

    add.focus()
    fireEvent.keyDown(dialog, { key: 'Tab', code: 'Tab' })
    expect(document.activeElement).toBe(firstInput)

    firstInput.focus()
    fireEvent.keyDown(dialog, { key: 'Tab', code: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(add)
  })

  it('supports triggerless controlled open state with focus trap and restore target', () => {
    const events: PatternEvent[] = []
    const openChanges: Array<{ open: boolean; meta: { reason: string; key?: string } }> = []
    render(
      <TriggerlessDialogFixture
        onEvent={(event) => events.push(event)}
        onOpenChange={(open, meta) => openChanges.push({ open, meta })}
      />,
    )

    const opener = screen.getByRole('button', { name: 'Open controlled dialog' })
    expect(opener.getAttribute('aria-expanded')).toBeNull()

    const dialog = screen.getByRole('dialog')
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBeTruthy()
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText('Sheet name'))

    const save = screen.getByRole('button', { name: 'Save' })
    save.focus()
    fireEvent.keyDown(dialog, { key: 'Tab', code: 'Tab' })
    expect(document.activeElement).toBe(screen.getByLabelText('Sheet name'))

    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(opener)
    expect(openChanges).toContainEqual({ open: false, meta: { reason: 'keyboard', key: 'dialog' } })
    expect(events).toContainEqual({ type: 'dismiss', key: 'dialog', meta: { reason: 'keyboard' } })
  })
})
