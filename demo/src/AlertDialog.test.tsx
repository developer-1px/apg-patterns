import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AlertDialog } from './AlertDialog'
import { initialAlertDialogData } from './alertdialogData'

describe('AlertDialog demo', () => {
  it('trigger click opens alertdialog with aria-modal and focuses confirm', () => {
    render(<AlertDialog data={initialAlertDialogData} />)
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
    const onCancel = vi.fn()
    render(<AlertDialog data={initialAlertDialogData} onCancel={onCancel} />)
    const trigger = screen.getByRole('button', { name: 'Discard draft' })
    fireEvent.click(trigger)

    const dialog = screen.getByRole('alertdialog')
    fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })

    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(trigger)
  })

  it('confirm click invokes onConfirm and closes', () => {
    const onConfirm = vi.fn()
    render(<AlertDialog data={initialAlertDialogData} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'Discard draft' }))
    fireEvent.click(screen.getByRole('button', { name: 'Discard' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('cancel click invokes onCancel and closes', () => {
    const onCancel = vi.fn()
    render(<AlertDialog data={initialAlertDialogData} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: 'Discard draft' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })
})
