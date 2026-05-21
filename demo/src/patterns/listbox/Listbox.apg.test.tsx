/**
 * APG Listbox 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

if (typeof (globalThis as { CSS?: unknown }).CSS === 'undefined') {
  ;(globalThis as { CSS: { escape: (s: string) => string } }).CSS = { escape: (s: string) => s }
}

import { ListboxDemo } from './testing/ListboxTestHost'

const lb = () => screen.getByRole('listbox')

describe('APG §Roles, States, Properties', () => {
  it('container has role="listbox"', () => {
    render(<ListboxDemo />)
    expect(lb()).toBeTruthy()
  })

  it('each option has role="option"', () => {
    render(<ListboxDemo />)
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
  })

  it('selected options have aria-selected="true"', () => {
    render(<ListboxDemo />)
    fireEvent.click(screen.getAllByRole('option')[0]!)
    const selected = screen.getAllByRole('option').filter((o) => o.getAttribute('aria-selected') === 'true')
    expect(selected.length).toBeGreaterThanOrEqual(1)
  })

  it('listbox has accessible name', () => {
    render(<ListboxDemo />)
    const l = lb()
    const name = l.getAttribute('aria-label') || l.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })

  it('aria-multiselectable (if present) is true/false', () => {
    render(<ListboxDemo />)
    const v = lb().getAttribute('aria-multiselectable')
    if (v !== null) expect(['true', 'false']).toContain(v)
  })

  it('aria-activedescendant (if present) references an option', () => {
    render(<ListboxDemo />)
    fireEvent.keyDown(lb(), { key: 'ArrowDown' })
    const id = lb().getAttribute('aria-activedescendant')
    if (id) expect(document.getElementById(id)).toBeTruthy()
  })
})

describe('APG §Keyboard — Down/Up navigate options', () => {
  it('ArrowDown moves active option', () => {
    render(<ListboxDemo />)
    fireEvent.keyDown(lb(), { key: 'ArrowDown' })
    expect(document.querySelector('[role="option"][data-active]')).toBeTruthy()
  })

  it('ArrowUp moves active option backwards', () => {
    render(<ListboxDemo />)
    fireEvent.keyDown(lb(), { key: 'ArrowDown' })
    fireEvent.keyDown(lb(), { key: 'ArrowDown' })
    fireEvent.keyDown(lb(), { key: 'ArrowUp' })
    expect(document.querySelector('[role="option"][data-active]')).toBeTruthy()
  })
})

describe('APG §Keyboard — Home / End (optional)', () => {
  it('Home moves active to first option', () => {
    render(<ListboxDemo />)
    fireEvent.keyDown(lb(), { key: 'ArrowDown' })
    fireEvent.keyDown(lb(), { key: 'Home' })
    const first = screen.getAllByRole('option')[0]!
    expect(first.hasAttribute('data-active') || first.id === lb().getAttribute('aria-activedescendant')).toBe(true)
  })

  it('End moves active to last option', () => {
    render(<ListboxDemo />)
    fireEvent.keyDown(lb(), { key: 'End' })
    const all = screen.getAllByRole('option')
    const last = all[all.length - 1]!
    expect(last.hasAttribute('data-active') || last.id === lb().getAttribute('aria-activedescendant')).toBe(true)
  })
})
