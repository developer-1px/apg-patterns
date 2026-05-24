import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DialogInteractionOwnershipDemo } from './DialogInteractionOwnershipDemo'

const option = (name: string) => screen.getByRole('option', { name })

describe('dialog interaction ownership demo', () => {
  it('keeps nested listbox keyboard intent when focus is in dialog chrome', () => {
    render(<DialogInteractionOwnershipDemo />)

    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }))
    const dialog = screen.getByRole('dialog', { name: 'Interaction ownership dialog' })
    dialog.focus()

    fireEvent.keyDown(dialog, { key: 'ArrowDown' })

    expect(option('Cherry').getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('active-owner-handled')
  })

  it('keeps search input arrows native while search owns interaction temporarily', () => {
    render(<DialogInteractionOwnershipDemo />)

    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }))
    const search = screen.getByRole('textbox', { name: 'Dialog search' })
    fireEvent.focus(search)

    fireEvent.keyDown(search, { key: 'ArrowDown' })

    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('dialog-search-input')
    expect(option('Banana').getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('browser-fallback')
  })

  it('restores nested listbox owner and option focus from search input', async () => {
    render(<DialogInteractionOwnershipDemo />)

    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }))
    const search = screen.getByRole('textbox', { name: 'Dialog search' })
    fireEvent.focus(search)

    fireEvent.keyDown(search, { key: 'Escape' })

    expect(screen.getByRole('dialog', { name: 'Interaction ownership dialog' })).toBeTruthy()
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('temporary-owner-restore-requested')
    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('dialog-listbox')
    await waitFor(() => expect(document.activeElement).toBe(option('Banana')))
  })

  it('routes allowed shell shortcuts from search owner without closing the dialog', () => {
    render(<DialogInteractionOwnershipDemo />)

    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }))
    const search = screen.getByRole('textbox', { name: 'Dialog search' })
    fireEvent.focus(search)

    fireEvent.keyDown(search, { key: 'k', metaKey: true })
    expect(screen.getByRole('status', { name: 'Command count' }).textContent).toBe('1')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('shell-owner-handled')
    expect(screen.getByRole('dialog', { name: 'Interaction ownership dialog' })).toBeTruthy()

    fireEvent.keyDown(search, { key: 's', metaKey: true })
    expect(screen.getByRole('status', { name: 'Command count' }).textContent).toBe('1')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('browser-fallback')
  })
})
