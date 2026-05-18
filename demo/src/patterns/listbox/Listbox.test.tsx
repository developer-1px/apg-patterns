import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

// jsdom lacks CSS.escape; Listbox uses it inside a useLayoutEffect.
if (typeof (globalThis as { CSS?: { escape?: (s: string) => string } }).CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape: (s: string) => string } }).CSS = { escape: (s: string) => s }
} else if (typeof (globalThis as { CSS: { escape?: (s: string) => string } }).CSS.escape !== 'function') {
  ;(globalThis as { CSS: { escape: (s: string) => string } }).CSS.escape = (s: string) => s
}

import { ListboxDemo } from './ListboxTestHost'

const activeOption = () => document.querySelector('[role="option"][data-active]') as HTMLElement | null

describe('Listbox demo — basic', () => {
  it('exposes aria-label on root listbox', () => {
    render(<ListboxDemo />)
    const listbox = screen.getByRole('listbox')
    expect(listbox.getAttribute('aria-label')).toBe('Fruits')
  })

  it('ArrowDown moves active option from Banana to Cherry', () => {
    render(<ListboxDemo />)
    const listbox = screen.getByRole('listbox')
    // initial active is 'b' (Banana)
    expect(activeOption()?.textContent).toBe('Banana')

    fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(activeOption()?.textContent).toBe('Cherry')
  })

  it('ArrowUp moves active option backwards', () => {
    render(<ListboxDemo />)
    const listbox = screen.getByRole('listbox')
    fireEvent.keyDown(listbox, { key: 'ArrowUp', code: 'ArrowUp' })
    expect(activeOption()?.textContent).toBe('Apple')
  })

  it('Home/End jump to first / last option', () => {
    render(<ListboxDemo />)
    const listbox = screen.getByRole('listbox')
    fireEvent.keyDown(listbox, { key: 'End', code: 'End' })
    expect(activeOption()?.textContent).toBe('Cherry')
    fireEvent.keyDown(listbox, { key: 'Home', code: 'Home' })
    expect(activeOption()?.textContent).toBe('Apple')
  })

  it('Enter toggles aria-selected on active option', () => {
    render(<ListboxDemo />)
    const listbox = screen.getByRole('listbox')
    // Move active to Cherry (currently Banana=active+selected)
    fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown' })
    fireEvent.keyDown(listbox, { key: 'Enter', code: 'Enter' })
    const options = screen.getAllByRole('option')
    expect(options[2]!.getAttribute('aria-selected')).toBe('true')
  })

  it('typeahead — typing "c" focuses Cherry', () => {
    render(<ListboxDemo />)
    const listbox = screen.getByRole('listbox')
    fireEvent.keyDown(listbox, { key: 'c' })
    expect(activeOption()?.textContent).toBe('Cherry')
  })
})

describe('Listbox demo — scrollable', () => {
  it('renders many options (scrollable APG variant)', () => {
    render(<ListboxDemo variant="scrollable" />)
    const options = screen.getAllByRole('option')
    expect(options.length).toBeGreaterThan(20)
    // First option matches initial activeKey 's0' → Aardvark.
    expect(options[0]!.textContent).toBe('Aardvark')
  })

  it('grouped variant emits aria-posinset / aria-setsize on each option', () => {
    render(<ListboxDemo variant="grouped" />)
    const options = screen.getAllByRole('option')
    expect(options[0]!.getAttribute('aria-posinset')).toBe('1')
    expect(options[0]!.getAttribute('aria-setsize')).toBe(String(options.length))
    expect(options[options.length - 1]!.getAttribute('aria-posinset')).toBe(String(options.length))
  })

  it('keyboard navigation moves active option', () => {
    render(<ListboxDemo variant="scrollable" />)
    const listbox = screen.getByRole('listbox')
    fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(activeOption()?.textContent).toBe('Albatross')
    fireEvent.keyDown(listbox, { key: 'End', code: 'End' })
    expect(activeOption()?.textContent).toBe('Emu')
  })

  it('keyboard navigation updates selected option', () => {
    render(<ListboxDemo variant="scrollable" />)
    const listbox = screen.getByRole('listbox')

    fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown' })

    const selected = screen.getAllByRole('option').filter((option) => option.getAttribute('aria-selected') === 'true')
    expect(selected.map((option) => option.textContent)).toEqual(['Albatross'])
  })
})

describe('Listbox demo — grouped', () => {
  it('renders role=group wrappers with aria-labelledby', () => {
    render(<ListboxDemo variant="grouped" />)
    const groups = screen.getAllByRole('group')
    expect(groups).toHaveLength(3)
    const labelId = groups[0]!.getAttribute('aria-labelledby')!
    expect(labelId).toBeTruthy()
    expect(document.getElementById(labelId)?.textContent).toBe('Vegetables')
  })

  it('keyboard navigation flows across groups', () => {
    render(<ListboxDemo variant="grouped" />)
    const listbox = screen.getByRole('listbox')
    // initial active is v-asparagus
    expect(activeOption()?.textContent).toBe('Asparagus')
    fireEvent.keyDown(listbox, { key: 'End', code: 'End' })
    expect(activeOption()?.textContent).toBe('Oats')
  })

  it('keyboard-focused option carries both active and focus-visible styling hooks', () => {
    render(<ListboxDemo variant="grouped" />)
    const listbox = screen.getByRole('listbox')

    fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown' })

    const broccoli = screen.getByRole('option', { name: 'Broccoli' })
    expect(broccoli.hasAttribute('data-active')).toBe(true)
    expect(broccoli.hasAttribute('data-focus-visible')).toBe(true)
    expect(document.activeElement).toBe(broccoli)
  })

  it('first group contains its option children', () => {
    render(<ListboxDemo variant="grouped" />)
    const firstGroup = screen.getAllByRole('group')[0]!
    expect(within(firstGroup).getAllByRole('option')).toHaveLength(3)
  })
})

describe('Listbox demo — rearrangeable (single)', () => {
  it('Alt+ArrowDown swaps active option with its successor', () => {
    render(<ListboxDemo variant="rearrangeable" />)
    const listbox = screen.getByRole('listbox')
    // initial order: Leonardo, Donatello, Raphael, ...; active=Leonardo
    const before = screen.getAllByRole('option').map((o) => o.textContent)
    expect(before[0]).toBe('Leonardo')
    fireEvent.keyDown(listbox, { key: 'ArrowDown', altKey: true })
    const after = screen.getAllByRole('option').map((o) => o.textContent)
    expect(after[0]).toBe('Donatello')
    expect(after[1]).toBe('Leonardo')
  })

  it('Alt+ArrowUp swaps active option with its predecessor', () => {
    render(<ListboxDemo variant="rearrangeable" />)
    const listbox = screen.getByRole('listbox')
    // move active to index 1 first, then up
    fireEvent.keyDown(listbox, { key: 'ArrowDown' })
    fireEvent.keyDown(listbox, { key: 'ArrowUp', altKey: true })
    const after = screen.getAllByRole('option').map((o) => o.textContent)
    expect(after[0]).toBe('Donatello')
    expect(after[1]).toBe('Leonardo')
  })

  it('Delete removes active option from the list', () => {
    render(<ListboxDemo variant="rearrangeable" />)
    const listbox = screen.getByRole('listbox')
    const beforeCount = screen.getAllByRole('option').length
    fireEvent.keyDown(listbox, { key: 'Delete' })
    const after = screen.getAllByRole('option')
    expect(after).toHaveLength(beforeCount - 1)
    expect(after.map((o) => o.textContent)).not.toContain('Leonardo')
  })
})

describe('Listbox demo — rearrangeable (multi)', () => {
  it('root advertises aria-multiselectable=true', () => {
    render(<ListboxDemo variant="rearrangeableMulti" />)
    const listbox = screen.getByRole('listbox')
    expect(listbox.getAttribute('aria-multiselectable')).toBe('true')
  })

  it('Shift+Click extends selection to range', () => {
    render(<ListboxDemo variant="rearrangeableMulti" />)
    const options = screen.getAllByRole('option')
    // anchor at index 0 (Leonardo is initial active+selected); shift+click index 2 (Raphael)
    fireEvent.click(options[2]!, { shiftKey: true })
    const selected = screen.getAllByRole('option').filter((o) => o.getAttribute('aria-selected') === 'true')
    expect(selected.map((o) => o.textContent)).toEqual(['Leonardo', 'Donatello', 'Raphael'])
  })

  it('Ctrl/Cmd+Click toggles a single option', () => {
    render(<ListboxDemo variant="rearrangeableMulti" />)
    const options = screen.getAllByRole('option')
    fireEvent.click(options[2]!, { ctrlKey: true })
    const selectedTexts = screen
      .getAllByRole('option')
      .filter((o) => o.getAttribute('aria-selected') === 'true')
      .map((o) => o.textContent)
    expect(selectedTexts).toContain('Leonardo')
    expect(selectedTexts).toContain('Raphael')
    // Toggle off
    fireEvent.click(screen.getAllByRole('option')[2]!, { ctrlKey: true })
    const after = screen
      .getAllByRole('option')
      .filter((o) => o.getAttribute('aria-selected') === 'true')
      .map((o) => o.textContent)
    expect(after).not.toContain('Raphael')
  })

  it('Shift+ArrowDown extends selection by one', () => {
    render(<ListboxDemo variant="rearrangeableMulti" />)
    const listbox = screen.getByRole('listbox')
    fireEvent.keyDown(listbox, { key: 'ArrowDown', shiftKey: true })
    const selected = screen
      .getAllByRole('option')
      .filter((o) => o.getAttribute('aria-selected') === 'true')
      .map((o) => o.textContent)
    expect(selected).toEqual(['Leonardo', 'Donatello'])
  })

  it('Ctrl+A selects all options', () => {
    render(<ListboxDemo variant="rearrangeableMulti" />)
    const listbox = screen.getByRole('listbox')
    fireEvent.keyDown(listbox, { key: 'a', ctrlKey: true })
    const all = screen.getAllByRole('option')
    expect(all.every((o) => o.getAttribute('aria-selected') === 'true')).toBe(true)
    // Toggle off — second Ctrl+A clears
    fireEvent.keyDown(listbox, { key: 'a', ctrlKey: true })
    const any = screen.getAllByRole('option').some((o) => o.getAttribute('aria-selected') === 'true')
    expect(any).toBe(false)
  })
})
