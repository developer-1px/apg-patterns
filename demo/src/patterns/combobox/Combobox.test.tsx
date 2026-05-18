import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternData, PatternEvent } from '../../../../src'
import { Combobox } from './Combobox'
import { buildComboboxData, FRUITS, reduceComboboxData } from './comboboxData'

type Variant = 'selectOnly' | 'listAutocomplete' | 'listWithInlineAutocomplete' | 'datepicker' | 'gridPopup'

function ComboboxDemo({ variant }: { variant: Variant }) {
  const [data, setData] = useState<PatternData>(() => buildComboboxData(undefined, variant))
  const handleEvent = (event: PatternEvent) => setData((current) => reduceComboboxData(current, event))
  return <Combobox data={data} onEvent={handleEvent} />
}

describe('Combobox demo — selectOnly', () => {
  it('ArrowDown opens popup and activates first option', () => {
    render(<ComboboxDemo variant="selectOnly" />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(input.getAttribute('aria-expanded')).toBe('true')
    const options = screen.getAllByRole('option')
    expect(options.length).toBe(FRUITS.length)
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].getAttribute('id'))
  })

  it('ArrowUp on closed popup opens and activates last option', () => {
    render(<ComboboxDemo variant="selectOnly" />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' })
    expect(input.getAttribute('aria-expanded')).toBe('true')
    const options = screen.getAllByRole('option')
    expect(input.getAttribute('aria-activedescendant')).toBe(options[options.length - 1].getAttribute('id'))
  })

  it('ArrowDown repeats move next; ArrowUp moves prev', () => {
    render(<ComboboxDemo variant="selectOnly" />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown' }) // open + idx 0
    fireEvent.keyDown(input, { key: 'ArrowDown' }) // idx 1
    fireEvent.keyDown(input, { key: 'ArrowDown' }) // idx 2
    let options = screen.getAllByRole('option')
    expect(input.getAttribute('aria-activedescendant')).toBe(options[2].getAttribute('id'))
    fireEvent.keyDown(input, { key: 'ArrowUp' }) // idx 1
    options = screen.getAllByRole('option')
    expect(input.getAttribute('aria-activedescendant')).toBe(options[1].getAttribute('id'))
  })

  it('Home / End jump to first / last option', () => {
    render(<ComboboxDemo variant="selectOnly" />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'End' })
    let options = screen.getAllByRole('option')
    expect(input.getAttribute('aria-activedescendant')).toBe(options[options.length - 1].getAttribute('id'))
    fireEvent.keyDown(input, { key: 'Home' })
    options = screen.getAllByRole('option')
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].getAttribute('id'))
  })

  it('Arrow keys clamp at popup boundaries', () => {
    render(<ComboboxDemo variant="selectOnly" />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    const options = screen.getAllByRole('option')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].getAttribute('id'))

    fireEvent.keyDown(input, { key: 'End' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.getAttribute('aria-activedescendant')).toBe(options[options.length - 1].getAttribute('id'))
  })

  it('Enter selects active option and closes popup', () => {
    render(<ComboboxDemo variant="selectOnly" />)
    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.keyDown(input, { key: 'ArrowDown' }) // open, first active
    fireEvent.keyDown(input, { key: 'ArrowDown' }) // second active
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryAllByRole('option').length).toBe(0)
    // selectOnly uses selectedKey label as displayed value
    expect(input.value).toBe(FRUITS[1].label)
  })

  it('Escape closes popup without changing selection', () => {
    render(<ComboboxDemo variant="selectOnly" />)
    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(input.value).toBe('')
  })

  it('printable character triggers first-character typeahead', () => {
    render(<ComboboxDemo variant="selectOnly" />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown' }) // open
    fireEvent.keyDown(input, { key: 'b' })
    // first 'b*' fruit is 'banana'
    const bananaOption = screen.getAllByRole('option').find((o) => o.textContent === 'Banana')
    expect(bananaOption).toBeTruthy()
    expect(input.getAttribute('aria-activedescendant')).toBe(bananaOption!.getAttribute('id'))
  })

  it('click on combobox opens popup', () => {
    render(<ComboboxDemo variant="selectOnly" />)
    const input = screen.getByRole('combobox')
    fireEvent.click(input)
    expect(input.getAttribute('aria-expanded')).toBe('true')
  })
})

describe('Combobox demo — listAutocomplete', () => {
  it('has aria-autocomplete=list', () => {
    render(<ComboboxDemo variant="listAutocomplete" />)
    expect(screen.getByRole('combobox').getAttribute('aria-autocomplete')).toBe('list')
  })

  it('typing filters options', () => {
    render(<ComboboxDemo variant="listAutocomplete" />)
    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'ap' } })
    const options = screen.getAllByRole('option')
    // 'ap' matches 'Apple' and 'Apricot' and 'Grape'
    const labels = options.map((o) => o.textContent)
    expect(labels.every((l) => /ap/i.test(l ?? ''))).toBe(true)
    expect(options.length).toBeLessThan(FRUITS.length)
  })

  it('Enter commits selection and closes popup', () => {
    render(<ComboboxDemo variant="listAutocomplete" />)
    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.keyDown(input, { key: 'ArrowDown' }) // open + first active
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(input.value).toBe(FRUITS[0].label)
  })
})

describe('Combobox demo — listWithInlineAutocomplete', () => {
  it('has aria-autocomplete=both', () => {
    render(<ComboboxDemo variant="listWithInlineAutocomplete" />)
    expect(screen.getByRole('combobox').getAttribute('aria-autocomplete')).toBe('both')
  })

  it('typing produces inline completion that extends the typed prefix', () => {
    render(<ComboboxDemo variant="listWithInlineAutocomplete" />)
    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'ap' } })
    // inline completion expands 'ap' → 'Apple' (or similar) — value length should exceed 'ap'
    expect(input.value.length).toBeGreaterThan(2)
    expect(input.value.toLowerCase().startsWith('ap')).toBe(true)
  })
})

describe('Combobox demo — variant data', () => {
  it('Date Picker keyboard input filters date options instead of fruit options', () => {
    render(<ComboboxDemo variant="datepicker" />)
    const input = screen.getByRole('combobox') as HTMLInputElement

    expect(input.placeholder).toBe('Search date')
    fireEvent.change(input, { target: { value: 'May 19' } })

    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['May 19, 2026'])
  })

  it('Grid Popup mouse selection commits a person option instead of a fruit option', () => {
    render(<ComboboxDemo variant="gridPopup" />)
    const input = screen.getByRole('combobox') as HTMLInputElement

    expect(input.placeholder).toBe('Search recipient')
    fireEvent.change(input, { target: { value: 'Grace' } })
    fireEvent.mouseDown(screen.getByRole('option', { name: 'Grace Hopper, Platform' }))

    expect(input.value).toBe('Grace Hopper, Platform')
    expect(input.getAttribute('aria-expanded')).toBe('false')
  })
})
