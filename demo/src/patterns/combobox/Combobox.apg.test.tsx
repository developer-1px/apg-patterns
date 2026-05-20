/**
 * APG Combobox 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternData, PatternEvent } from '../../../../src/react'
import { Combobox } from './Combobox'
import { buildComboboxData, reduceComboboxData } from './comboboxData'

function ComboboxDemo() {
  const [data, setData] = useState<PatternData>(() => buildComboboxData(undefined, 'listAutocomplete'))
  const handleEvent = (event: PatternEvent) => setData((current) => reduceComboboxData(current, event))
  return <Combobox data={data} onEvent={handleEvent} />
}

const cb = () => screen.getByRole('combobox')

describe('APG §Roles, States, Properties', () => {
  it('input element has role="combobox"', () => {
    render(<ComboboxDemo />)
    expect(cb()).toBeTruthy()
  })

  it('exposes aria-expanded', () => {
    render(<ComboboxDemo />)
    expect(['true', 'false']).toContain(cb().getAttribute('aria-expanded'))
  })

  it('exposes aria-controls referencing popup', () => {
    render(<ComboboxDemo />)
    fireEvent.keyDown(cb(), { key: 'ArrowDown' })
    const id = cb().getAttribute('aria-controls')
    expect(id).toBeTruthy()
    expect(document.getElementById(id!)).toBeTruthy()
  })

  it('exposes aria-haspopup (or implicit listbox)', () => {
    render(<ComboboxDemo />)
    const hp = cb().getAttribute('aria-haspopup')
    if (hp !== null) expect(['listbox', 'grid', 'tree', 'dialog', 'true']).toContain(hp)
  })

  it('aria-autocomplete is none/list/both when present', () => {
    render(<ComboboxDemo />)
    const v = cb().getAttribute('aria-autocomplete')
    if (v !== null) expect(['none', 'list', 'both']).toContain(v)
  })
})

describe('APG §Keyboard — ArrowDown opens popup', () => {
  it('ArrowDown sets aria-expanded=true', () => {
    render(<ComboboxDemo />)
    fireEvent.keyDown(cb(), { key: 'ArrowDown' })
    expect(cb().getAttribute('aria-expanded')).toBe('true')
  })
})

describe('APG §Keyboard — Escape dismisses popup', () => {
  it('Escape closes popup', () => {
    render(<ComboboxDemo />)
    fireEvent.keyDown(cb(), { key: 'ArrowDown' })
    expect(cb().getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(cb(), { key: 'Escape' })
    expect(cb().getAttribute('aria-expanded')).toBe('false')
  })
})

describe('APG §Focus management', () => {
  it('aria-activedescendant points at focused option when popup open', () => {
    render(<ComboboxDemo />)
    fireEvent.keyDown(cb(), { key: 'ArrowDown' })
    const id = cb().getAttribute('aria-activedescendant')
    if (id) expect(document.getElementById(id)).toBeTruthy()
  })

  it('DOM focus remains on combobox while active descendant changes', () => {
    render(<ComboboxDemo />)
    cb().focus()
    fireEvent.keyDown(cb(), { key: 'ArrowDown' })
    const firstActive = cb().getAttribute('aria-activedescendant')
    fireEvent.keyDown(cb(), { key: 'ArrowDown' })
    expect(document.activeElement).toBe(cb())
    expect(cb().getAttribute('aria-activedescendant')).not.toBe(firstActive)
  })

  it('focused option in popup exposes aria-selected=true', () => {
    render(<ComboboxDemo />)
    fireEvent.keyDown(cb(), { key: 'ArrowDown' })
    const id = cb().getAttribute('aria-activedescendant')
    expect(id).toBeTruthy()
    expect(document.getElementById(id!)?.getAttribute('aria-selected')).toBe('true')
  })
})
