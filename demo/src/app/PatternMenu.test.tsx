import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { PatternMenu } from './PatternMenu'
import { patternItems } from '../shared/demoPatterns'
import type { PatternKey } from '../shared/demoPatterns'

function PatternMenuDemo() {
  const [value, setValue] = useState<PatternKey>('treeview')
  return <PatternMenu value={value} onChange={setValue} />
}

describe('PatternMenu', () => {
  it('uses the listbox APG keyboard surface', () => {
    render(<PatternMenuDemo />)
    const listbox = screen.getByRole('listbox', { name: /APG patterns/i })
    const expectedShortcuts = ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space']

    expect(listbox.getAttribute('aria-keyshortcuts')).toBe(expectedShortcuts.join(' '))
  })

  it('ArrowDown selects the next pattern', () => {
    render(<PatternMenuDemo />)
    const listbox = screen.getByRole('listbox', { name: /APG patterns/i })

    const treeviewIdx = patternItems.findIndex((p) => p.key === 'treeview')
    const nextLabel = patternItems[treeviewIdx + 1]?.label ?? patternItems[0].label
    expect(screen.getByRole('option', { name: 'Treeview' }).getAttribute('aria-selected')).toBe('true')
    fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown' })

    expect(screen.getByRole('option', { name: nextLabel }).getAttribute('aria-selected')).toBe('true')
  })

  it('ArrowDown moves DOM focus to the selected pattern', () => {
    render(<PatternMenuDemo />)
    const listbox = screen.getByRole('listbox', { name: /APG patterns/i })
    const treeviewIdx = patternItems.findIndex((p) => p.key === 'treeview')
    const nextLabel = patternItems[treeviewIdx + 1]?.label ?? patternItems[0].label

    screen.getByRole('option', { name: 'Treeview' }).focus()
    fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown' })

    expect(document.activeElement).toBe(screen.getByRole('option', { name: nextLabel }))
  })

  it('End jumps to the last pattern and Home returns to the first', () => {
    render(<PatternMenuDemo />)
    const listbox = screen.getByRole('listbox', { name: /APG patterns/i })

    const lastLabel = patternItems[patternItems.length - 1].label
    const firstLabel = patternItems[0].label

    fireEvent.keyDown(listbox, { key: 'End', code: 'End' })
    expect(screen.getByRole('option', { name: lastLabel }).getAttribute('aria-selected')).toBe('true')

    fireEvent.keyDown(listbox, { key: 'Home', code: 'Home' })
    expect(screen.getByRole('option', { name: firstLabel }).getAttribute('aria-selected')).toBe('true')
  })

  it('click selects a pattern', () => {
    render(<PatternMenuDemo />)

    fireEvent.click(screen.getByRole('option', { name: 'Grid' }))
    expect(screen.getByRole('option', { name: 'Grid' }).getAttribute('aria-selected')).toBe('true')
  })
})
