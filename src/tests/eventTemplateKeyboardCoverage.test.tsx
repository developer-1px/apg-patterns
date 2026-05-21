import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { createPatternRuntime, reducePatternData, type PatternData, type PatternDefinition, type PatternEvent } from '../index'
import { resolveTransitionValue } from '../kernel/patternTransitions'

const data = {
  items: {
    a: { label: 'Alpha', href: '#alpha', labelledBy: 'label-a', valuemin: 1, valuemax: 9, valuetext: 'five' },
    b: { label: 'Beta' },
    name: { label: 'Name' },
    value: { label: 'Value' },
  },
  relations: {
    rootKeys: ['a', 'b'],
    controlsByKey: { a: ['b'] },
    ownerByKey: { a: 'b' },
    rowKeys: ['a', 'b'],
    columnKeys: ['name', 'value'],
  },
  state: {
    activeKey: 'a',
    expandedKeys: ['a'],
    selectedKeys: ['a'],
    disabledKeys: ['a'],
    checkedByKey: { a: 'mixed' },
    pressedByKey: { a: true },
    currentByKey: { a: 'page' },
    readonly: true,
    levelByKey: { a: 1 },
    posInSetByKey: { a: 1 },
    setSizeByKey: { a: 2 },
    rowIndexByKey: { a: 1 },
    columnIndexByKey: { a: 1 },
    sortByKey: { a: 'ascending' },
    valueByKey: { a: 5 },
  },
  refs: { label: 'Template host', labelledBy: 'template-label' },
} satisfies PatternData

const definition = {
  apgPattern: 'template-host',
  rootRole: 'listbox',
  containedRoles: ['option'],
  parts: {
    root: {
      role: 'listbox',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
        { attribute: 'aria-hidden', from: 'literal.true' },
        { attribute: 'aria-roledescription', from: 'options.roledescription' },
        { attribute: 'aria-orientation', from: 'options.orientation' },
        { attribute: 'aria-multiselectable', from: 'options.selectionMode.multiple' },
        { attribute: 'aria-activedescendant', from: 'state.activeKey.elementId' },
        { attribute: 'aria-rowcount', from: 'state.rowCount' },
        { attribute: 'aria-colcount', from: 'state.colCount' },
        { attribute: 'aria-readonly', from: 'state.readonly' },
      ],
    },
    option: {
      role: 'option',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-labelledby', from: 'items.labelledBy' },
        { attribute: 'href', from: 'items.href' },
        { attribute: 'aria-valuemin', from: 'items.valuemin' },
        { attribute: 'aria-valuemax', from: 'items.valuemax' },
        { attribute: 'aria-valuetext', from: 'items.valuetext' },
        { attribute: 'aria-disabled', from: 'state.disabledKeys' },
        { attribute: 'aria-expanded', from: 'state.expandedKeys' },
        { attribute: 'aria-selected', from: 'state.selectedKeys' },
        { attribute: 'aria-checked', from: 'state.checkedByKey' },
        { attribute: 'aria-pressed', from: 'state.pressedByKey' },
        { attribute: 'aria-current', from: 'state.currentByKey' },
        { attribute: 'aria-level', from: 'state.levelByKey' },
        { attribute: 'aria-posinset', from: 'state.posInSetByKey' },
        { attribute: 'aria-setsize', from: 'state.setSizeByKey' },
        { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
        { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
        { attribute: 'aria-sort', from: 'state.sortByKey' },
        { attribute: 'aria-valuenow', from: 'state.valueByKey' },
        { attribute: 'aria-controls', from: 'relations.controlsByKey' },
        { attribute: 'aria-owns', from: 'relations.ownerByKey' },
        { attribute: 'aria-hidden', from: 'state.inactiveKey' },
      ],
    },
    optionFromOptions: {
      role: 'option',
      aria: [
        { attribute: 'aria-label', from: 'options.label' },
        { attribute: 'aria-roledescription', from: 'options.slideRoledescription' },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [
    { shortcut: 'a', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'b', cases: [{ case: 'always', events: [{ type: 'selectAll' }] }] },
    { shortcut: 'c', cases: [{ case: 'always', events: [{ type: 'selectColumn' }] }] },
    { shortcut: 'd', cases: [{ case: 'always', events: [{ type: 'selectRow' }] }] },
    { shortcut: 'e', cases: [{ case: 'always', events: [{ type: 'extendSelection', direction: 'last' }] }] },
    { shortcut: 'f', cases: [{ case: 'always', events: [{ type: 'expandActiveRow', expanded: true }] }] },
    { shortcut: 'g', cases: [{ case: 'always', events: [{ type: 'inputValue', value: 'draft', inline: true }] }] },
    { shortcut: 'h', cases: [{ case: 'always', events: [{ type: 'inputValue', key: '$activeKey', value: 'draft-keyed' }] }] },
    { shortcut: 'i', cases: [{ case: 'always', events: [{ type: 'commitValue', value: 'committed' }] }] },
    { shortcut: 'j', cases: [{ case: 'always', events: [{ type: 'commitValue', key: '$activeKey', value: 'committed-keyed' }] }] },
    { shortcut: 'k', cases: [{ case: 'always', events: [{ type: 'typeahead', query: 'alp' }] }] },
    { shortcut: 'l', cases: [{ case: 'always', events: [{ type: 'dismiss' }] }] },
    { shortcut: 'm', cases: [{ case: 'always', events: [{ type: 'dismiss', key: '$activeKey' }] }] },
    { shortcut: 'n', cases: [{ case: 'always', events: [{ type: 'reorder', keys: ['b', 'a'] }] }] },
    { shortcut: 'o', cases: [{ case: 'always', events: [{ type: 'reorder', key: '$activeKey', keys: ['b', 'a'] }] }] },
    { shortcut: 'p', cases: [{ case: 'always', events: [{ type: 'remove', activeKey: null }] }] },
    { shortcut: 'q', cases: [{ case: 'always', events: [{ type: 'remove', key: '$activeKey', keys: ['a'], activeKey: 'b', selectedKeys: ['b'] }] }] },
    { shortcut: 'r', cases: [{ case: 'always', events: [{ type: 'editEnd' }] }] },
    { shortcut: 's', cases: [{ case: 'always', events: [{ type: 'editEnd', key: '$activeKey' }] }] },
    { shortcut: 't', cases: [{ case: 'always', events: [{ type: 'focus', key: '$activeKey' }] }] },
    { shortcut: 'u', cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
    { shortcut: 'v', cases: [{ case: 'always', events: [{ type: 'select', key: '$activeKey' }] }] },
    { shortcut: 'w', cases: [{ case: 'always', events: [{ type: 'expand', key: '$activeKey' }] }] },
    { shortcut: 'x', cases: [{ case: 'always', events: [{ type: 'expand', key: '$activeKey', expanded: true }] }] },
    { shortcut: 'y', cases: [{ case: 'always', events: [{ type: 'check', key: '$activeKey' }] }] },
    { shortcut: 'z', cases: [{ case: 'always', events: [{ type: 'press', key: '$activeKey' }] }] },
    { shortcut: '0', cases: [{ case: 'always', events: [{ type: 'value', key: '$activeKey', value: 3 }] }] },
    { shortcut: '1', cases: [{ case: 'always', events: [{ type: 'valueStep', key: '$activeKey', direction: 'increment' }] }] },
    { shortcut: '2', cases: [{ case: 'always', events: [{ type: 'collapse', key: '$activeKey' }] }] },
    { shortcut: '3', cases: [{ case: 'always', events: [{ type: 'close', key: '$activeKey' }] }] },
    { shortcut: '4', cases: [{ case: 'always', events: [{ type: 'sort', key: '$activeKey', sort: 'ascending' }] }] },
    { shortcut: '5', cases: [{ case: 'always', events: [{ type: 'editStart', key: '$activeKey' }] }] },
    { shortcut: '6', cases: [{ case: 'always', events: [{ type: 'editStart', key: '$activeKey', value: 'seed' }] }] },
    { shortcut: '7', cases: [{ case: 'always', events: [{ type: 'editDraft', key: '$activeKey', value: 'draft' }] }] },
  ],
} satisfies PatternDefinition

function TemplateHost({ onEvent }: { onEvent: (event: PatternEvent) => void }) {
  const runtime = createPatternRuntime({
    definition,
    data,
    options: {
      orientation: 'vertical',
      label: 'Runtime label',
      roledescription: 'template',
      slideRoledescription: 'slide',
      selectionMode: 'multiple',
    },
    onEvent,
    keyToElementId: (key) => `template-${key}`,
  })

  return (
    <div data-testid="template-host" {...runtime.getRootProps()}>
      {runtime.visibleKeys.map((key) => (
        <div key={key} {...runtime.getItemProps('option', key)}>
          {(data.items as Record<string, { label?: string }>)[key]?.label}
        </div>
      ))}
      <div data-testid="option-from-options" {...runtime.getItemProps('optionFromOptions', 'a')} />
    </div>
  )
}

describe('event templates through keyboard input', () => {
  it('resolves every event template variant from keydown bindings', () => {
    const events: PatternEvent[] = []
    render(<TemplateHost onEvent={(event) => events.push(event)} />)
    const host = screen.getByTestId('template-host')
    const alpha = screen.getByText('Alpha').closest('[role="option"]') as HTMLElement

    expect(host.getAttribute('aria-activedescendant')).toBe('template-a')
    expect(host.getAttribute('aria-multiselectable')).toBe('true')
    expect(screen.getByTestId('option-from-options').getAttribute('aria-label')).toBe('Runtime label')
    expect(screen.getByTestId('option-from-options').getAttribute('aria-roledescription')).toBe('slide')
    expect(alpha.getAttribute('aria-controls')).toBe('template-b')
    expect(alpha.getAttribute('aria-owns')).toBe('template-b')
    expect(alpha.getAttribute('aria-valuetext')).toBe('five')

    for (const key of 'abcdefghijklmnopqrstuvwxyz01234567') {
      fireEvent.keyDown(host, { key })
    }

    expect(events.map((event) => event.type)).toEqual([
      'navigate',
      'selectAll',
      'selectColumn',
      'selectRow',
      'extendSelection',
      'expandActiveRow',
      'inputValue',
      'inputValue',
      'commitValue',
      'commitValue',
      'typeahead',
      'dismiss',
      'dismiss',
      'reorder',
      'reorder',
      'remove',
      'remove',
      'editEnd',
      'editEnd',
      'focus',
      'activate',
      'select',
      'expand',
      'expand',
      'check',
      'press',
      'value',
      'valueStep',
      'collapse',
      'close',
      'sort',
      'editStart',
      'editStart',
      'editDraft',
    ])
    expect(events.find((event) => event.type === 'expand' && event.expanded === false)).toBeTruthy()
    expect(events.find((event) => event.type === 'inputValue' && event.inline === true)).toBeTruthy()
    expect(events.find((event) => event.type === 'remove' && event.key === 'a')).toBeTruthy()
  })

  it('applies declarative transitions from keyboard input events', () => {
    render(<TransitionHost />)
    const host = screen.getByTestId('transition-host')
    const alpha = () => screen.getByRole('option', { name: 'Alpha' })

    fireEvent.keyDown(host, { key: 's' })
    expect(alpha().getAttribute('aria-selected')).toBe('true')

    fireEvent.keyDown(host, { key: 'a' })
    expect(alpha().getAttribute('aria-expanded')).toBe('true')

    fireEvent.keyDown(host, { key: 'r' })
    expect(alpha().getAttribute('aria-expanded')).toBe('false')

    fireEvent.keyDown(host, { key: 't' })
    expect(alpha().getAttribute('aria-disabled')).toBe('true')
    fireEvent.keyDown(host, { key: 't' })
    expect(alpha().getAttribute('aria-disabled')).toBeNull()

    fireEvent.keyDown(host, { key: 'c' })
    expect(alpha().getAttribute('aria-checked')).toBe('true')

    fireEvent.keyDown(host, { key: 'n' })
    expect(screen.getByTestId('transition-active').textContent).toBe('Alpha')

    fireEvent.keyDown(host, { key: 'l' })
    expect(alpha().getAttribute('aria-disabled')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Named transition' }))
    expect(screen.getByRole('option', { name: 'Beta' }).getAttribute('aria-disabled')).toBe('true')

    fireEvent.keyDown(host, { key: 'p' })
    fireEvent.keyDown(host, { key: 'v' })
    fireEvent.click(screen.getByRole('button', { name: 'Select with range' }))
    fireEvent.click(screen.getByRole('button', { name: 'Named mismatch' }))
    expect(screen.getByTestId('transition-state').textContent).toBe('a|b|true|7|')

    fireEvent.click(screen.getByRole('button', { name: 'Resolve transition values' }))
    expect(screen.getByTestId('transition-values').textContent).toBe('true|false|false|4|null|null||null|null|null|null|null|null|null')
  })
})

const transitionData = {
  items: {
    a: { label: 'Alpha' },
    b: { label: 'Beta' },
  },
  relations: { rootKeys: ['a', 'b'] },
  state: { activeKey: 'a', selectedKeys: [], expandedKeys: [], disabledKeys: [], checkedByKey: {} },
} satisfies PatternData

const transitionDefinition = {
  apgPattern: 'transition-host',
  rootRole: 'listbox',
  containedRoles: ['option'],
  parts: {
    root: { role: 'listbox' },
    option: {
      role: 'option',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-selected', from: 'state.selectedKeys' },
        { attribute: 'aria-expanded', from: 'state.expandedKeys' },
        { attribute: 'aria-disabled', from: 'state.disabledKeys' },
        { attribute: 'aria-checked', from: 'state.checkedByKey' },
      ],
    },
  },
  navigation: { visibleOrder: { kind: 'flat' }, targets: {} },
  keyboard: [
    { shortcut: 's', cases: [{ case: 'always', events: [{ type: 'select', key: '$activeKey' }] }] },
    { shortcut: 'a', cases: [{ case: 'always', events: [{ type: 'expand', key: '$activeKey', expanded: true }] }] },
    { shortcut: 'r', cases: [{ case: 'always', events: [{ type: 'collapse', key: '$activeKey' }] }] },
    { shortcut: 't', cases: [{ case: 'always', events: [{ type: 'press', key: '$activeKey' }] }] },
    { shortcut: 'c', cases: [{ case: 'always', events: [{ type: 'check', key: '$activeKey', checked: true }] }] },
    { shortcut: 'n', cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
    { shortcut: 'l', cases: [{ case: 'always', events: [{ type: 'sort', key: '$activeKey', sort: 'other' }] }] },
    { shortcut: 'p', cases: [{ case: 'always', events: [{ type: 'press', key: '$activeKey', pressed: true }] }] },
    { shortcut: 'v', cases: [{ case: 'always', events: [{ type: 'value', key: '$activeKey', value: 7 }] }] },
  ],
  transitions: [
    { on: 'select', actions: [{ kind: 'replaceSet', field: 'selectedKeys', values: [{ from: '$activeKey' }] }] },
    { on: 'select', when: { kind: 'hasActiveKey' }, actions: [{ kind: 'set', field: 'anchorKey', value: { from: '$event.anchorKey' } }] },
    { on: 'select', when: { kind: 'hasActiveKey' }, actions: [{ kind: 'set', field: 'extentKey', value: { from: '$event.extentKey' } }] },
    { on: 'expand', actions: [{ kind: 'setMembership', field: 'expandedKeys', value: { from: '$event.key' }, present: { from: '$event.expanded' } }] },
    { on: 'collapse', actions: [{ kind: 'remove', field: 'expandedKeys', value: { from: '$event.key' } }] },
    { on: 'collapse', name: 'ignored', actions: [{ kind: 'add', field: 'expandedKeys', value: { literal: 'b' } }] },
    { on: 'press', actions: [{ kind: 'toggleInSet', field: 'disabledKeys', value: { from: '$event.key' } }] },
    { on: 'press', actions: [{ kind: 'setMembership', field: 'requiredKeys', value: { literal: 'b' }, present: { from: '$event.pressed' } }] },
    { on: 'check', actions: [{ kind: 'setRecordValue', field: 'checkedByKey', key: { from: '$event.key' }, value: { from: '$event.checked' } }] },
    { on: 'check', actions: [{ kind: 'setRecordValue', field: 'checkedByKey', key: { from: '$event.extentKey' }, value: { from: '$event.checked' } }] },
    { on: 'activate', actions: [{ kind: 'set', field: 'activeKey', value: { from: '$event.key' } }] },
    { on: 'value', actions: [{ kind: 'setRecordValue', field: 'valueByKey', key: { from: '$event.key' }, value: { from: '$event.value' } }] },
    { on: 'value', actions: [{ kind: 'add', field: 'selectedKeys', value: { from: '$event.value' } }] },
    { on: 'select', actions: [{ kind: 'replaceSet', field: 'busyKeys', values: [{ from: '$event.keys' }] }] },
    { on: 'sort', name: 'literal', actions: [{ kind: 'add', field: 'disabledKeys', value: { literal: 'b' } }] },
    { on: 'sort', name: 'fallback', actions: [{ kind: 'set', field: 'currentByKey', value: { from: '$event.value' } }] },
  ],
} satisfies PatternDefinition

function TransitionHost() {
  const [current, setCurrent] = useState<PatternData>(transitionData)
  const [resolved, setResolved] = useState('')
  const runtime = createPatternRuntime({
    definition: transitionDefinition,
    data: current,
    onEvent: (event) => setCurrent((data) => reducePatternData(transitionDefinition, data, event)),
  })

  return (
    <div>
      <div data-testid="transition-host" {...runtime.getRootProps()}>
        {runtime.visibleKeys.map((key) => (
          <div key={key} {...runtime.getItemProps('option', key)}>
            {current.items[key]?.label}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setCurrent((data) => reducePatternData(transitionDefinition, data, { type: 'sort', key: 'a', sort: 'other', name: 'literal' } as never))}
      >
        Named transition
      </button>
      <button
        type="button"
        onClick={() => setCurrent((data) => reducePatternData(transitionDefinition, data, { type: 'select', keys: ['a'], anchorKey: 'a', extentKey: 'b' }))}
      >
        Select with range
      </button>
      <button
        type="button"
        onClick={() => setCurrent((data) => reducePatternData(transitionDefinition, data, { type: 'sort', key: 'a', sort: 'other', name: 'other' } as never))}
      >
        Named mismatch
      </button>
      <button
        type="button"
        onClick={() => {
          setResolved([
            resolveTransitionValue({ from: '$event.expanded' }, { type: 'expand', key: 'a', expanded: true }, current),
            resolveTransitionValue({ from: '$event.checked' }, { type: 'check', key: 'a', checked: false }, current),
            resolveTransitionValue({ from: '$event.pressed' }, { type: 'press', key: 'a', pressed: false }, current),
            resolveTransitionValue({ from: '$event.value' }, { type: 'value', key: 'a', value: 4 }, current),
            resolveTransitionValue({ from: '$activeKey' }, { type: 'dismiss' }, { items: {}, state: {} }),
            resolveTransitionValue({ from: '$event.key' }, { type: 'dismiss' }, current),
            resolveTransitionValue({ from: '$event.keys' }, { type: 'dismiss' }, current),
            resolveTransitionValue({ from: '$event.anchorKey' }, { type: 'dismiss' }, current),
            resolveTransitionValue({ from: '$event.extentKey' }, { type: 'dismiss' }, current),
            resolveTransitionValue({ from: '$event.expanded' }, { type: 'dismiss' }, current),
            resolveTransitionValue({ from: '$event.checked' }, { type: 'dismiss' }, current),
            resolveTransitionValue({ from: '$event.pressed' }, { type: 'dismiss' }, current),
            resolveTransitionValue({ from: '$event.value' }, { type: 'dismiss' }, current),
            resolveTransitionValue({ from: '$unknown' } as never, { type: 'dismiss' }, current),
          ].map(String).join('|'))
        }}
      >
        Resolve transition values
      </button>
      <output data-testid="transition-active">{current.items[current.state?.activeKey ?? '']?.label}</output>
      <output data-testid="transition-state">{[
        current.state?.anchorKey ?? '',
        current.state?.extentKey ?? '',
        String(current.state?.requiredKeys?.includes('b') ?? ''),
        String(current.state?.valueByKey?.a ?? ''),
        current.state?.busyKeys?.join(',') ?? '',
      ].join('|')}</output>
      <output data-testid="transition-values">{resolved}</output>
    </div>
  )
}
