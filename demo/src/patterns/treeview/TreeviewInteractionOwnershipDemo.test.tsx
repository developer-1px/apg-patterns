import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TreeviewInteractionOwnershipDemo } from './TreeviewInteractionOwnershipDemo'

const treeitem = (name: string) => screen.getByRole('treeitem', { name })

describe('treeview interaction ownership demo', () => {
  it('keeps tree keyboard intent when native focus is on a scroll container', () => {
    render(<TreeviewInteractionOwnershipDemo />)

    const scrollContainer = screen.getByRole('region', { name: 'Tree scroll container' })
    fireEvent.focus(scrollContainer)

    fireEvent.keyDown(scrollContainer, { key: 'ArrowDown' })

    expect(treeitem('ADR').getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('active-owner-handled')
  })

  it('protects input text entry from the active tree owner', () => {
    render(<TreeviewInteractionOwnershipDemo />)

    const input = screen.getByRole('textbox', { name: 'Tree filter' })
    fireEvent.focus(input)

    fireEvent.keyDown(input, { key: 'ArrowDown' })

    expect(treeitem('Docs').getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('tree-filter-input')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('browser-fallback')
  })

  it('restores tree ownership and DOM focus from a temporary input owner', async () => {
    render(<TreeviewInteractionOwnershipDemo />)

    const input = screen.getByRole('textbox', { name: 'Tree filter' })
    fireEvent.focus(input)
    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('tree-filter-input')

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('temporary-owner-restore-requested')
    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('treeview')
    await waitFor(() => expect(document.activeElement).toBe(treeitem('Docs')))
  })

  it('routes shell shortcuts only when the active owner allows them', () => {
    render(<TreeviewInteractionOwnershipDemo />)

    const scrollContainer = screen.getByRole('region', { name: 'Tree scroll container' })
    fireEvent.focus(scrollContainer)

    fireEvent.keyDown(scrollContainer, { key: 'k', metaKey: true })
    expect(screen.getByRole('status', { name: 'Command count' }).textContent).toBe('1')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('shell-owner-handled')

    fireEvent.keyDown(scrollContainer, { key: 'k', ctrlKey: true })
    expect(screen.getByRole('status', { name: 'Command count' }).textContent).toBe('2')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('shell-owner-handled')

    fireEvent.keyDown(scrollContainer, { key: 's', metaKey: true })
    expect(screen.getByRole('status', { name: 'Command count' }).textContent).toBe('2')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('browser-fallback')
  })
})
