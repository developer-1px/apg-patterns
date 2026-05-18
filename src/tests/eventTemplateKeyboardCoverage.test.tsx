import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createPatternRuntime, type PatternData, type PatternDefinition, type PatternEvent } from '../index'

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
      roledescription: 'template',
      selectionMode: 'multiple',
    },
    onEvent,
    keyToElementId: (key) => `template-${key}`,
  })

  return (
    <div data-testid="template-host" {...runtime.getRootProps()}>
      {runtime.visibleKeys.map((key) => (
        <div key={key} {...runtime.getItemProps('option', key)}>
          {data.items[key]?.label}
        </div>
      ))}
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
})
