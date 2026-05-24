import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListboxToolbarInteractionOwnershipDemo } from './ListboxToolbarInteractionOwnershipDemo'

const option = (name: string) => screen.getByRole('option', { name })

describe('listbox toolbar interaction ownership demo', () => {
  it('keeps listbox vertical intent while a toolbar command has focus', () => {
    render(<ListboxToolbarInteractionOwnershipDemo />)

    const bold = screen.getByRole('button', { name: 'Bold' })
    fireEvent.focus(bold)
    fireEvent.keyDown(bold, { key: 'ArrowDown' })

    expect(option('Cherry').getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('listbox')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('active-owner-handled')
  })

  it('keeps toolbar roving keys inside the toolbar owner', () => {
    render(<ListboxToolbarInteractionOwnershipDemo />)

    const bold = screen.getByRole('button', { name: 'Bold' })
    fireEvent.focus(bold)
    fireEvent.keyDown(bold, { key: 'ArrowRight' })

    expect(screen.getByRole('button', { name: 'Italic' }).getAttribute('tabindex')).toBe('0')
    expect(option('Banana').getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('active-owner-handled')
  })

  it('keeps toolbar commands owned by the toolbar instead of the listbox', () => {
    render(<ListboxToolbarInteractionOwnershipDemo />)

    const bold = screen.getByRole('button', { name: 'Bold' })
    fireEvent.focus(bold)
    fireEvent.keyDown(bold, { key: 'Enter' })

    expect(screen.getByRole('status', { name: 'Toolbar command count' }).textContent).toBe('1')
    expect(option('Banana').getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('listbox-toolbar')
  })

  it('protects filter input arrow keys while the temporary input owner is active', () => {
    render(<ListboxToolbarInteractionOwnershipDemo />)

    const input = screen.getByRole('textbox', { name: 'Listbox filter' })
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('listbox-filter-input')
    expect(option('Banana').getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('browser-fallback')
  })

  it('restores listbox owner and option focus from the filter input', async () => {
    render(<ListboxToolbarInteractionOwnershipDemo />)

    const input = screen.getByRole('textbox', { name: 'Listbox filter' })
    fireEvent.focus(input)
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('temporary-owner-restore-requested')
    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('listbox')
    await waitFor(() => expect(document.activeElement).toBe(option('Banana')))
  })

  it('routes allowed shell shortcuts from the toolbar owner', () => {
    render(<ListboxToolbarInteractionOwnershipDemo />)

    const bold = screen.getByRole('button', { name: 'Bold' })
    fireEvent.focus(bold)

    fireEvent.keyDown(bold, { key: 'k', metaKey: true })
    expect(screen.getByRole('status', { name: 'Shell command count' }).textContent).toBe('1')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('shell-owner-handled')

    fireEvent.keyDown(bold, { key: 's', metaKey: true })
    expect(screen.getByRole('status', { name: 'Shell command count' }).textContent).toBe('1')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('browser-fallback')
  })
})
