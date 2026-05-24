import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GridInteractionOwnershipDemo } from './GridInteractionOwnershipDemo'

const cellOf = (key: string) => document.getElementById(`gridcell-${key}`)!

describe('grid interaction ownership demo', () => {
  it('keeps grid navigation intent when focus is on a scroll container', () => {
    render(<GridInteractionOwnershipDemo />)

    const scrollContainer = screen.getByRole('region', { name: 'Grid scroll container' })
    fireEvent.focus(scrollContainer)
    fireEvent.keyDown(scrollContainer, { key: 'ArrowRight' })

    expect(screen.getByRole('status', { name: 'Grid active key' }).textContent).toBe('e12')
    expect(cellOf('e12').hasAttribute('data-active')).toBe(true)
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('active-owner-handled')
  })

  it('keeps editor arrow keys native while a temporary input owner is active', () => {
    render(<GridInteractionOwnershipDemo />)

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' })
    const input = cellOf('e11').querySelector('input[data-edit]') as HTMLInputElement
    fireEvent.focus(input)

    fireEvent.keyDown(input, { key: 'ArrowRight' })

    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('grid-cell-editor')
    expect(screen.getByRole('status', { name: 'Grid active key' }).textContent).toBe('e11')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('browser-fallback')
  })

  it('restores grid ownership and cell focus when edit mode exits', async () => {
    render(<GridInteractionOwnershipDemo />)

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' })
    const input = cellOf('e11').querySelector('input[data-edit]') as HTMLInputElement
    fireEvent.focus(input)
    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('grid-cell-editor')

    fireEvent.keyDown(input, { key: 'Escape' })

    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('temporary-owner-restore-requested')
    expect(screen.getByRole('status', { name: 'Interaction owner' }).textContent).toBe('grid')
    expect(cellOf('e11').querySelector('input[data-edit]')).toBeNull()
    await waitFor(() => expect(document.activeElement).toBe(cellOf('e11')))
  })

  it('routes shell shortcuts from temporary edit mode only when allowed', () => {
    render(<GridInteractionOwnershipDemo />)

    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Enter' })
    const input = cellOf('e11').querySelector('input[data-edit]') as HTMLInputElement
    fireEvent.focus(input)

    fireEvent.keyDown(input, { key: 'k', metaKey: true })
    expect(screen.getByRole('status', { name: 'Command count' }).textContent).toBe('1')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('shell-owner-handled')

    fireEvent.keyDown(input, { key: 's', metaKey: true })
    expect(screen.getByRole('status', { name: 'Command count' }).textContent).toBe('1')
    expect(screen.getByRole('status', { name: 'Interaction route' }).textContent).toBe('browser-fallback')
  })
})
