import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { PatternMenu, patternMenuKeyboardShortcuts } from './PatternMenu'
import type { PatternKey } from './demoPatterns'

function PatternMenuDemo() {
  const [value, setValue] = useState<PatternKey>('treeview')
  return <PatternMenu value={value} onChange={setValue} />
}

describe('PatternMenu', () => {
  it('uses the listbox APG keyboard surface', () => {
    render(<PatternMenuDemo />)
    const listbox = screen.getByRole('listbox', { name: /APG patterns/i })

    expect(listbox.getAttribute('aria-keyshortcuts')).toBe(patternMenuKeyboardShortcuts.join(' '))
    expect(patternMenuKeyboardShortcuts).toEqual(['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space'])
  })

  it('ArrowDown selects the next pattern', () => {
    render(<PatternMenuDemo />)
    const listbox = screen.getByRole('listbox', { name: /APG patterns/i })

    expect(screen.getByRole('option', { name: 'Treeview' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown' })

    expect(screen.getByRole('option', { name: 'Listbox' }).getAttribute('aria-selected')).toBe('true')
  })

  it('End jumps to the last pattern and Home returns to the first', () => {
    render(<PatternMenuDemo />)
    const listbox = screen.getByRole('listbox', { name: /APG patterns/i })

    fireEvent.keyDown(listbox, { key: 'End', code: 'End' })
    expect(screen.getByRole('option', { name: 'Combobox' }).getAttribute('aria-selected')).toBe('true')

    fireEvent.keyDown(listbox, { key: 'Home', code: 'Home' })
    expect(screen.getByRole('option', { name: 'Treeview' }).getAttribute('aria-selected')).toBe('true')
  })

  it('click selects a pattern', () => {
    render(<PatternMenuDemo />)

    fireEvent.click(screen.getByRole('option', { name: 'Grid' }))
    expect(screen.getByRole('option', { name: 'Grid' }).getAttribute('aria-selected')).toBe('true')
  })
})
