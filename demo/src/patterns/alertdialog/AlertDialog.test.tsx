import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AlertDialogDemo } from './testing/AlertDialogTestHost'

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
    expect(screen.getByRole('heading', { name: 'Discard draft?' }).id).toBe(dialog.getAttribute('aria-labelledby'))
    expect(screen.getByText('Changes will be lost.').id).toBe(dialog.getAttribute('aria-describedby'))

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
})
