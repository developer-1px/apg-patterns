import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { dialogDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src'
import { Dialog } from './Dialog'
import { initialDialogData } from './dialogData'

function DialogDemo() {
  const [data, setData] = useState<PatternData>(initialDialogData)
  const handleEvent = (event: PatternEvent) => setData((current) => reducePatternData(dialogDefinition, current, event))
  return <Dialog data={data} onEvent={handleEvent} />
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
})
