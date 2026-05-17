import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { entry } from './entry'

function GridEntryDemo() {
  const demo = entry.useDemoPattern(() => undefined)
  return (
    <>
      {demo.variants}
      {demo.preview}
    </>
  )
}

describe('Grid variant menu', () => {
  it('selects a grid variant and replaces the preview data', () => {
    render(<GridEntryDemo />)

    expect(screen.getByRole('grid').getAttribute('aria-label')).toBe('Transactions')

    fireEvent.click(screen.getByRole('option', { name: 'Data: editable' }))

    expect(screen.getByRole('grid').getAttribute('aria-label')).toBe('Editable contacts')
    expect(screen.getByRole('grid').getAttribute('aria-readonly')).toBeNull()
  })

  it('uses keyboard navigation to select the next grid variant', () => {
    render(<GridEntryDemo />)
    const variants = screen.getByRole('listbox', { name: 'grid variants' })

    expect(screen.getByRole('option', { name: 'Data: read-only' }).getAttribute('aria-selected')).toBe('true')

    fireEvent.keyDown(variants, { key: 'ArrowDown', code: 'ArrowDown' })

    expect(screen.getByRole('option', { name: 'Data: sortable' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('grid').getAttribute('aria-label')).toBe('Sortable planets')
  })
})
