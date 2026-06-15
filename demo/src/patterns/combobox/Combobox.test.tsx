import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { comboboxDefinition, listboxDefinition, reducePatternData, useAutocompleteListbox, type PatternData, type PatternEvent } from '../../../../src/react'
import { Combobox } from './Combobox'
import { buildComboboxData, FRUITS, reduceComboboxData } from './comboboxData'
import { ComboboxDemo } from './testing/ComboboxTestHost'

function KernelComboboxDemo({ activeKey }: { activeKey?: string | null }) {
  const [data, setData] = useState<PatternData>(() => {
    const initial = buildComboboxData(['apple', 'banana', 'cherry'], 'selectOnly')
    return { ...initial, state: { ...initial.state, activeKey: activeKey ?? initial.state?.activeKey ?? null } }
  })
  const handleEvent = (event: PatternEvent) => setData((current) => reducePatternData(comboboxDefinition, current, event))
  return <Combobox data={data} onEvent={handleEvent} />
}

function ComboboxReducerEdgesDemo() {
  const [data, setData] = useState<PatternData>(() => buildComboboxData(['apple'], 'selectOnly'))
  const apply = (event: PatternEvent) => setData((current) => reduceComboboxData(current, event))
  const applyFrom = (nextData: PatternData, event: PatternEvent) => setData(reduceComboboxData(nextData, event))

  return (
    <div>
      <button type="button" onClick={() => apply({ type: 'focus', key: 'apple' })}>Focus apple</button>
      <button type="button" onClick={() => apply({ type: 'navigate', direction: 'previous' })}>Previous</button>
      <button type="button" onClick={() => applyFrom(buildComboboxData(['apple', 'apricot'], 'selectOnly'), { type: 'focus', key: 'apricot' })}>Seed apricot</button>
      <button type="button" onClick={() => apply({ type: 'navigate', direction: 'previous' })}>Previous from second</button>
      <button type="button" onClick={() => applyFrom(buildComboboxData([], 'selectOnly'), { type: 'navigate', direction: 'next' })}>Empty navigate</button>
      <button type="button" onClick={() => applyFrom({ items: { combobox: { label: 'Fruit' } }, state: { query: 'x' } }, { type: 'typeahead', query: 'z' })}>Typeahead fallback</button>
      <button type="button" onClick={() => applyFrom({ items: { combobox: { label: 'Fruit' } }, state: {} }, { type: 'inputValue', value: 'ba', inline: true })}>Input default variant</button>
      <button type="button" onClick={() => apply({ type: 'typeahead', query: 'zz' })}>No match typeahead</button>
      <button type="button" onClick={() => apply({ type: 'inputValue', value: '' })}>Empty input</button>
      <button type="button" onClick={() => apply({ type: 'dismiss' })}>Ignored event</button>
      <output data-testid="combobox-active">{String(data.state?.activeKey ?? '')}</output>
      <output data-testid="combobox-query">{String(data.state?.query ?? '')}</output>
    </div>
  )
}

const AUTOCOMPLETE_OWNER_KEY = 'formula-owner'
const FORMULA_ITEMS = [
  { key: 'sum', label: 'SUM' },
  { key: 'average', label: 'AVERAGE' },
  { key: 'count', label: 'COUNT' },
] as const

function buildFormulaAutocompleteData(
  query = '=',
  state: PatternData['state'] = { activeKey: null, expandedKeys: [], selectedKeys: [] },
): PatternData {
  const needle = query.replace(/^=/, '').trim().toLowerCase()
  const visibleItems = FORMULA_ITEMS.filter((item) => !needle || item.label.toLowerCase().startsWith(needle))

  return {
    items: {
      [AUTOCOMPLETE_OWNER_KEY]: { label: 'Formula' },
      ...Object.fromEntries(visibleItems.map((item) => [item.key, { label: item.label }])),
    },
    relations: { rootKeys: visibleItems.map((item) => item.key) },
    refs: { label: 'Formula suggestions' },
    state,
  }
}

function formulaLabel(key: string | null | undefined): string {
  return FORMULA_ITEMS.find((item) => item.key === key)?.label ?? ''
}

function FormulaInputAutocompleteDemo() {
  const [query, setQuery] = useState('=')
  const [data, setData] = useState<PatternData>(() => buildFormulaAutocompleteData())
  const [committed, setCommitted] = useState('')
  const open = Boolean(data.state?.expandedKeys?.includes(AUTOCOMPLETE_OWNER_KEY))
  const autocomplete = useAutocompleteListbox<HTMLInputElement>(
    data,
    (event) => {
      if (event.type === 'select') setCommitted(formulaLabel(event.keys[0]))
      setData((current) => reducePatternData(listboxDefinition, current, event))
    },
    {
      elementIdPrefix: 'formula-option-',
      label: 'Formula',
      open,
      ownerKey: AUTOCOMPLETE_OWNER_KEY,
      popupId: 'formula-listbox',
    },
  )

  return (
    <div>
      <input
        {...autocomplete.ownerProps}
        value={query}
        onChange={(event) => {
          const nextQuery = event.currentTarget.value
          setQuery(nextQuery)
          setData(buildFormulaAutocompleteData(nextQuery, {
            activeKey: null,
            expandedKeys: [AUTOCOMPLETE_OWNER_KEY],
            selectedKeys: [],
          }))
        }}
      />
      {open ? (
        <ul {...autocomplete.popupProps}>
          {autocomplete.renderItems.map((item) => (
            <li key={item.key} {...item.optionProps}>{item.label}</li>
          ))}
        </ul>
      ) : null}
      <output data-testid="formula-committed">{committed}</output>
    </div>
  )
}

function ContenteditableAutocompleteDemo() {
  const [data, setData] = useState<PatternData>(() => buildFormulaAutocompleteData('=s'))
  const [dismissed, setDismissed] = useState('false')
  const open = Boolean(data.state?.expandedKeys?.includes(AUTOCOMPLETE_OWNER_KEY))
  const autocomplete = useAutocompleteListbox<HTMLDivElement>(
    data,
    (event) => {
      if (event.type === 'dismiss') setDismissed('true')
      setData((current) => reducePatternData(listboxDefinition, current, event))
    },
    {
      elementIdPrefix: 'cell-option-',
      label: 'Cell formula',
      open,
      ownerKey: AUTOCOMPLETE_OWNER_KEY,
      popupId: 'cell-listbox',
    },
  )

  return (
    <div>
      <div
        {...autocomplete.ownerProps}
        contentEditable
        data-testid="cell-editor"
        suppressContentEditableWarning
        tabIndex={0}
      >
        =s
      </div>
      {open ? (
        <div {...autocomplete.popupProps}>
          {autocomplete.renderItems.map((item) => (
            <div key={item.key} {...item.optionProps}>{item.label}</div>
          ))}
        </div>
      ) : null}
      <output data-testid="cell-dismissed">{dismissed}</output>
    </div>
  )
}

describe('Autocomplete listbox owner adapter', () => {
  it('keeps input focus while active descendant tracks popup options', () => {
    render(<FormulaInputAutocompleteDemo />)
    const input = screen.getByRole('combobox', { name: 'Formula' }) as HTMLInputElement
    input.focus()

    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(document.activeElement).toBe(input)
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(input.getAttribute('aria-controls')).toBe('formula-listbox')

    const options = screen.getAllByRole('option')
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].getAttribute('id'))
    expect(screen.getByRole('listbox').getAttribute('aria-activedescendant')).toBeNull()

    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(input.getAttribute('aria-activedescendant')).toBe(options[1].getAttribute('id'))
    expect(fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' })).toBe(true)
    expect(screen.getByTestId('formula-committed').textContent).toBe('AVERAGE')
    expect(input.getAttribute('aria-expanded')).toBe('false')
  })

  it('keeps contenteditable focus and maps Escape to dismiss and close', () => {
    render(<ContenteditableAutocompleteDemo />)
    const editor = screen.getByTestId('cell-editor')
    editor.focus()

    fireEvent.keyDown(editor, { key: 'ArrowDown', code: 'ArrowDown' })
    const option = screen.getByRole('option', { name: 'SUM' })
    expect(document.activeElement).toBe(editor)
    expect(editor.getAttribute('role')).toBe('combobox')
    expect(editor.getAttribute('aria-controls')).toBe('cell-listbox')
    expect(editor.getAttribute('aria-activedescendant')).toBe(option.getAttribute('id'))

    fireEvent.keyDown(editor, { key: 'Escape', code: 'Escape' })
    expect(document.activeElement).toBe(editor)
    expect(editor.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('option')).toBeNull()
    expect(screen.getByTestId('cell-dismissed').textContent).toBe('true')
  })
})

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

  it('kernel navigation resolves option targets from keyboard input', () => {
    render(<KernelComboboxDemo activeKey="combobox" />)
    const input = screen.getByRole('combobox')
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
    let options = screen.getAllByRole('option')
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].getAttribute('id'))

    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
    options = screen.getAllByRole('option')
    expect(input.getAttribute('aria-activedescendant')).toBe(options[1].getAttribute('id'))

    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' })
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].getAttribute('id'))

    fireEvent.keyDown(input, { key: 'End', code: 'End' })
    expect(input.getAttribute('aria-activedescendant')).toBe(options[options.length - 1].getAttribute('id'))

    fireEvent.keyDown(input, { key: 'Home', code: 'Home' })
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].getAttribute('id'))
  })

  it('covers reducer edge cases from pointer controls', () => {
    render(<ComboboxReducerEdgesDemo />)

    fireEvent.click(screen.getByRole('button', { name: 'Focus apple' }))
    expect(screen.getByTestId('combobox-active').textContent).toBe('apple')

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }))
    expect(screen.getByTestId('combobox-active').textContent).toBe('apple')

    fireEvent.click(screen.getByRole('button', { name: 'Seed apricot' }))
    expect(screen.getByTestId('combobox-active').textContent).toBe('apricot')

    fireEvent.click(screen.getByRole('button', { name: 'Previous from second' }))
    expect(screen.getByTestId('combobox-active').textContent).toBe('apple')

    fireEvent.click(screen.getByRole('button', { name: 'Empty navigate' }))
    expect(screen.getByTestId('combobox-active').textContent).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Typeahead fallback' }))
    expect(screen.getByTestId('combobox-query').textContent).toBe('xz')
    expect(screen.getByTestId('combobox-active').textContent).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Input default variant' }))
    expect(screen.getByTestId('combobox-query').textContent).toBe('Banana')
    expect(screen.getByTestId('combobox-active').textContent).toBe('banana')

    fireEvent.click(screen.getByRole('button', { name: 'No match typeahead' }))
    expect(screen.getByTestId('combobox-active').textContent).toBe('banana')

    fireEvent.click(screen.getByRole('button', { name: 'Empty input' }))
    expect(screen.getByTestId('combobox-query').textContent).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Ignored event' }))
    expect(screen.getByTestId('combobox-query').textContent).toBe('')
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

  it('keyboard navigation is harmless when filtering leaves no popup options', () => {
    render(<ComboboxDemo variant="listAutocomplete" />)
    const input = screen.getByRole('combobox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'zzzz' } })
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(screen.queryAllByRole('option')).toEqual([])

    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' })
    fireEvent.keyDown(input, { key: 'Home', code: 'Home' })
    fireEvent.keyDown(input, { key: 'End', code: 'End' })

    expect(input.getAttribute('aria-activedescendant')).toBeNull()
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
