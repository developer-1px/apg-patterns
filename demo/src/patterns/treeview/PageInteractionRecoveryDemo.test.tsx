import { act, fireEvent, render, screen, within, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageInteractionRecoveryDemo } from './PageInteractionRecoveryDemo'

const status = (name: string) => screen.getByRole('status', { name }).textContent
const cellOf = (key: string) => document.getElementById(`gridcell-${key}`)!
const focusElement = (element: HTMLElement) => act(() => element.focus())

describe('page interaction recovery demo', () => {
  it('restores page focus from incidental and scroll targets to the active owner cursor', async () => {
    render(<PageInteractionRecoveryDemo />)

    const scrollTarget = screen.getByRole('region', { name: 'Page scroll recovery target' })
    focusElement(scrollTarget)

    await waitFor(() => expect(status('Focus guard action')).toBe('restore-active-owner'))
    expect(status('Interaction owner')).toBe('page-tree')
    expect(Number(status('Focus recovery count'))).toBeGreaterThan(0)
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('treeitem', { name: 'Docs' })))

    const recoveryCount = Number(status('Focus recovery count'))
    focusElement(screen.getByRole('region', { name: 'Page incidental recovery target' }))
    await waitFor(() => expect(Number(status('Focus recovery count'))).toBeGreaterThan(recoveryCount))
  })

  it('routes toolbar movement separately and restores listbox ownership for vertical intent', async () => {
    render(<PageInteractionRecoveryDemo />)

    const bold = screen.getByRole('button', { name: 'Bold' })
    focusElement(bold)
    await waitFor(() => expect(status('Interaction owner')).toBe('page-toolbar'))

    fireEvent.keyDown(bold, { key: 'ArrowRight' })

    expect(status('Interaction owner')).toBe('page-toolbar')
    const italic = screen.getByRole('button', { name: 'Italic' })
    expect(italic.getAttribute('tabindex')).toBe('0')
    await waitFor(() => expect(document.activeElement).toBe(italic))

    fireEvent.keyDown(italic, { key: 'ArrowDown' })

    expect(status('Interaction route')).toBe('active-owner-handled')
    await waitFor(() => expect(status('Interaction owner')).toBe('page-listbox'))
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('option', { name: 'Cherry' })))
  })

  it('protects search input arrow keys while still allowing explicit restore and global shortcuts', async () => {
    render(<PageInteractionRecoveryDemo />)

    focusElement(cellOf('e11'))
    await waitFor(() => expect(status('Interaction owner')).toBe('page-grid'))

    const input = screen.getByRole('searchbox', { name: 'Page search' })
    focusElement(input)
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    expect(status('Interaction owner')).toBe('page-search')
    expect(status('Interaction route')).toBe('browser-fallback')

    fireEvent.keyDown(input, { key: 'k', metaKey: true })
    expect(status('Shell command count')).toBe('1')
    expect(status('Interaction route')).toBe('shell-owner-handled')

    fireEvent.keyDown(input, { key: 'Escape' })
    expect(status('Interaction route')).toBe('temporary-owner-restore-requested')
    expect(status('Interaction owner')).toBe('page-grid')
    await waitFor(() => expect(document.activeElement).toBe(cellOf('e11')))
  })

  it('keeps grid editor keys native and restores grid cell focus when edit mode exits', async () => {
    render(<PageInteractionRecoveryDemo />)

    const cell = cellOf('e11')
    focusElement(cell)
    await waitFor(() => expect(status('Interaction owner')).toBe('page-grid'))
    fireEvent.keyDown(cell, { key: 'Enter' })

    const input = await screen.findByRole('textbox', { name: 'Grid cell editor' })
    fireEvent.keyDown(input, { key: 'ArrowRight' })

    expect(status('Interaction owner')).toBe('page-grid-editor')
    await waitFor(() => expect(status('Interaction route')).toBe('browser-fallback'))

    fireEvent.keyDown(input, { key: 'Escape' })

    await waitFor(() => expect(status('Interaction route')).toBe('temporary-owner-restore-requested'))
    await waitFor(() => expect(status('Interaction owner')).toBe('page-grid'))
    await waitFor(() => expect(document.activeElement).toBe(cellOf('e11')))
  })

  it('does not let the active pattern steal a key owned by a coexisting sibling pattern', () => {
    render(<PageInteractionRecoveryDemo />)

    const activeGridCellId = () =>
      document.querySelector('[role="gridcell"][tabindex="0"], [role="columnheader"][tabindex="0"]')?.id

    // The tree owns the page on mount; its sibling grid keeps its own cursor.
    expect(status('Interaction owner')).toBe('page-tree')
    const gridCursorBefore = activeGridCellId()

    // PageDown is a grid navigation key the tree does not own. With the tree
    // active it must fall through to the browser instead of being mis-handled,
    // and the inactive grid sibling must not move its cursor.
    fireEvent.keyDown(screen.getByRole('treeitem', { name: 'Docs' }), { key: 'PageDown' })

    expect(status('Interaction route')).toBe('browser-fallback')
    expect(status('Interaction owner')).toBe('page-tree')
    expect(activeGridCellId()).toBe(gridCursorBefore)
  })

  it('recovers between modal listbox, modal search, and the pre-modal page owner', async () => {
    render(<PageInteractionRecoveryDemo />)

    focusElement(cellOf('e11'))
    await waitFor(() => expect(status('Interaction owner')).toBe('page-grid'))
    fireEvent.click(screen.getByRole('button', { name: 'Open modal' }))

    const dialog = screen.getByRole('dialog', { name: 'Page recovery modal' })
    expect(status('Interaction owner')).toBe('page-dialog-listbox')
    expect(within(dialog).getByRole('option', { name: 'Banana' }).getAttribute('tabindex')).toBe('0')

    const modalSearch = within(dialog).getByRole('searchbox', { name: 'Modal search' })
    modalSearch.focus()
    fireEvent.keyDown(modalSearch, { key: 'ArrowDown' })
    expect(status('Interaction owner')).toBe('page-dialog-search')
    expect(status('Interaction route')).toBe('browser-fallback')

    fireEvent.keyDown(modalSearch, { key: 'Escape' })
    expect(status('Interaction owner')).toBe('page-dialog-listbox')
    await waitFor(() => expect(document.activeElement).toBe(within(dialog).getByRole('option', { name: 'Banana' })))

    fireEvent.keyDown(within(dialog).getByRole('option', { name: 'Banana' }), { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Page recovery modal' })).toBeNull()
    expect(status('Interaction owner')).toBe('page-grid')
    await waitFor(() => expect(document.activeElement).toBe(cellOf('e11')))
  })
})
