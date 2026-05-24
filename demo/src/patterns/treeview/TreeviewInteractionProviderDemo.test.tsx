import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TreeviewInteractionProviderDemo } from './TreeviewInteractionProviderDemo'

const treeitem = (name: string) => screen.getByRole('treeitem', { name })

describe('treeview interaction provider demo', () => {
  it('uses the React focus guard hook to restore incidental scroll focus to the active tree item', async () => {
    render(<TreeviewInteractionProviderDemo />)

    const scrollContainer = screen.getByRole('region', { name: 'Provider tree scroll container' })
    fireEvent.focus(scrollContainer)

    expect(screen.getByRole('status', { name: 'Focus guard action' }).textContent).toBe('restore-active-owner')
    await waitFor(() => expect(document.activeElement).toBe(treeitem('Docs')))
  })

  it('routes tree keys through the React keyboard hook after focus guard restoration', () => {
    render(<TreeviewInteractionProviderDemo />)

    const scrollContainer = screen.getByRole('region', { name: 'Provider tree scroll container' })
    fireEvent.focus(scrollContainer)
    fireEvent.keyDown(scrollContainer, { key: 'ArrowDown' })

    expect(treeitem('ADR').getAttribute('tabindex')).toBe('0')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('active-owner-handled')
  })

  it('restores tree ownership from a temporary input through the React hooks', async () => {
    render(<TreeviewInteractionProviderDemo />)

    const input = screen.getByRole('textbox', { name: 'Provider tree filter' })
    fireEvent.focus(input)
    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('tree-filter-input')

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('temporary-owner-restore-requested')
    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('treeview')
    await waitFor(() => expect(document.activeElement).toBe(treeitem('Docs')))
  })

  it('routes allowed shell shortcuts through the React keyboard hook', () => {
    render(<TreeviewInteractionProviderDemo />)

    const scrollContainer = screen.getByRole('region', { name: 'Provider tree scroll container' })
    fireEvent.focus(scrollContainer)

    fireEvent.keyDown(scrollContainer, { key: 'k', metaKey: true })
    expect(screen.getByRole('status', { name: 'Command count' }).textContent).toBe('1')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('shell-owner-handled')

    fireEvent.keyDown(scrollContainer, { key: 's', metaKey: true })
    expect(screen.getByRole('status', { name: 'Command count' }).textContent).toBe('1')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('browser-fallback')
  })
})
