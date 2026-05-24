import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MenuSearchInteractionOwnershipDemo } from './MenuSearchInteractionOwnershipDemo'

const menuitem = (name: string) => screen.getByRole('menuitem', { name })

describe('menu search interaction ownership demo', () => {
  it('opens the menu through the active menu owner', () => {
    render(<MenuSearchInteractionOwnershipDemo />)

    const trigger = screen.getByRole('button', { name: /Actions/ })
    fireEvent.focus(trigger)
    fireEvent.keyDown(trigger, { key: 'ArrowDown' })

    expect(screen.getByRole('menu')).toBeTruthy()
    expect(menuitem('Action 1').getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('active-owner-handled')
  })

  it('keeps search input arrows native while search owns interaction temporarily', () => {
    render(<MenuSearchInteractionOwnershipDemo />)

    fireEvent.keyDown(screen.getByRole('button', { name: /Actions/ }), { key: 'ArrowDown' })
    const search = screen.getByRole('searchbox', { name: 'Menu search' })
    fireEvent.focus(search)
    fireEvent.keyDown(search, { key: 'ArrowDown' })

    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('menu-search-input')
    expect(menuitem('Action 1').getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('browser-fallback')
  })

  it('restores menu ownership and item focus from the search input', async () => {
    render(<MenuSearchInteractionOwnershipDemo />)

    fireEvent.keyDown(screen.getByRole('button', { name: /Actions/ }), { key: 'ArrowDown' })
    const search = screen.getByRole('searchbox', { name: 'Menu search' })
    fireEvent.focus(search)

    fireEvent.keyDown(search, { key: 'Escape' })

    expect(screen.getByRole('menu')).toBeTruthy()
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('temporary-owner-restore-requested')
    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('menu')
    await waitFor(() => expect(document.activeElement).toBe(menuitem('Action 1')))
  })

  it('continues menu movement after search restores the menu owner', () => {
    render(<MenuSearchInteractionOwnershipDemo />)

    fireEvent.keyDown(screen.getByRole('button', { name: /Actions/ }), { key: 'ArrowDown' })
    const search = screen.getByRole('searchbox', { name: 'Menu search' })
    fireEvent.focus(search)
    fireEvent.keyDown(search, { key: 'Escape' })

    fireEvent.keyDown(menuitem('Action 1'), { key: 'ArrowDown' })

    expect(menuitem('Action 2').getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('active-owner-handled')
  })

  it('routes shell shortcuts from search owner only when allowed', () => {
    render(<MenuSearchInteractionOwnershipDemo />)

    fireEvent.keyDown(screen.getByRole('button', { name: /Actions/ }), { key: 'ArrowDown' })
    const search = screen.getByRole('searchbox', { name: 'Menu search' })
    fireEvent.focus(search)

    fireEvent.keyDown(search, { key: 'k', metaKey: true })
    expect(screen.getByRole('status', { name: 'Command count' }).textContent).toBe('1')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('shell-owner-handled')

    fireEvent.keyDown(search, { key: 's', metaKey: true })
    expect(screen.getByRole('status', { name: 'Command count' }).textContent).toBe('1')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('browser-fallback')
  })
})
