import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { createParentByKey, evaluatePredicate, resolveNavigationTarget, type PatternData, type PatternEvent } from '../index'
import { handleListboxMultiKeyDown } from '../patterns/listbox/handleListboxMultiKeyDown'
import { useListboxPattern } from '../patterns/listbox/useListboxPattern'
import { cellRowKey, visibleCells, visibleRowKeys } from '../patterns/treegrid/geometry'
import '../patterns/treegrid/predicates'

const data = {
  items: {
    row: { label: 'Row' },
    child: { label: 'Child' },
    name: { label: 'Name' },
    cell: { label: 'Cell' },
  },
  relations: {
    rootKeys: ['row'],
    rowKeys: ['row', 'child'],
    childrenByKey: { row: ['child'] },
    columnKeys: ['name'],
    cells: [{ rowKey: 'row', columnKey: 'name', cellKey: 'cell' }],
  },
  state: { activeKey: 'cell', expandedKeys: ['row'] },
} satisfies PatternData

function ListboxRuntimeHost() {
  const [events, setEvents] = useState<PatternEvent[]>([])
  const listbox = useListboxPattern(
    {
      items: { a: { label: 'Alpha' }, b: { label: 'Beta' } },
      relations: { rootKeys: ['a', 'b'] },
      state: { activeKey: 'a', selectedKeys: ['a'], disabledKeys: ['b'] },
    },
    (event) => setEvents((current) => [...current, event]),
    { elementIdPrefix: 'edge-option-' },
  )

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          listbox.actions.focus('b')
          listbox.actions.select('b')
        }}
      >
        Run listbox runtime
      </button>
      <output data-testid="listbox-runtime">
        {[
          listbox.state.activeKey,
          listbox.state.selectedKeys.join(','),
          listbox.state.disabledKeys.join(','),
          listbox.ids.forKey('a'),
          listbox.keyToElementId('b'),
          listbox.renderItems.length,
          events.map((event) => `${event.type}:${'key' in event ? event.key ?? '' : 'keys' in event ? event.keys.join(',') : ''}`).join('|'),
        ].join('|')}
      </output>
    </div>
  )
}

function ListboxTreegridHelperHost() {
  const [result, setResult] = useState('')

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const events: PatternEvent[] = []
          const runtime = {
            options: { selectionMode: 'multiple' },
            visibleKeys: ['a'],
            data: { items: { a: {} }, relations: { rootKeys: ['a'] }, state: { activeKey: 'a', selectedKeys: [] } },
            emit: (event: PatternEvent) => events.push(event),
          }
          const eventBase = { shiftKey: true, ctrlKey: false, metaKey: false, preventDefault: () => undefined }
          handleListboxMultiKeyDown(runtime as never, { ...eventBase, key: 'ArrowDown' } as never)
          handleListboxMultiKeyDown(runtime as never, { ...eventBase, key: 'ArrowUp' } as never)
          handleListboxMultiKeyDown(runtime as never, { ...eventBase, key: 'Home', ctrlKey: true } as never)
          handleListboxMultiKeyDown(runtime as never, { ...eventBase, key: 'End', ctrlKey: true } as never)
          setResult(events.map((event) => event.type === 'select' ? event.keys.join(',') : event.type).join('|') || 'none')
        }}
      >
        Run listbox keys
      </button>
      <button
        type="button"
        onClick={() => {
          const parentByKey = createParentByKey(data)
          const emptyRows: PatternData = { ...data, relations: { ...data.relations, rootKeys: [], rowKeys: [], cells: [] } }
          const collapsed: PatternData = { ...data, state: { activeKey: 'cell', expandedKeys: [] } }
          const rows = [
            resolveNavigationTarget({ kind: 'treegridPage', direction: 'up' }, { activeKey: 'cell', data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridPage', direction: 'down' }, { activeKey: null as never, data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridPage', direction: 'down' }, { activeKey: 'missing', data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridPage', direction: 'down' }, { activeKey: 'cell', data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridParentRowFirstCell' }, { activeKey: 'cell', data: collapsed, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridParentRowFirstCell' }, { activeKey: 'child', data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridRow', action: 'gridStart' }, { activeKey: 'cell', data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridRow', action: 'gridEnd' }, { activeKey: 'cell', data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridRow', action: 'down' }, { activeKey: null as never, data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridRow', action: 'up' }, { activeKey: 'missing', data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridRow', action: 'sideways' }, { activeKey: 'cell', data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridRowPage', direction: 'up' }, { activeKey: 'cell', data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridRowPage', direction: 'down' }, { activeKey: null as never, data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridRowPage', direction: 'down' }, { activeKey: 'missing', data, parentByKey, visibleKeys: [] }),
            resolveNavigationTarget({ kind: 'treegridRowPage', direction: 'down' }, { activeKey: 'cell', data: emptyRows, parentByKey: createParentByKey(emptyRows), visibleKeys: [] }),
          ]
          setResult(rows.map(String).join('|'))
        }}
      >
        Run treegrid navigation
      </button>
      <button
        type="button"
        onClick={() => {
          setResult([
            visibleRowKeys({ ...data, relations: { rowKeys: ['row'] }, state: {} }).join(','),
            visibleCells({ ...data, relations: { rootKeys: ['row'], rowKeys: ['row'], columnKeys: [] }, state: {} }).length,
            cellRowKey(data, null),
            evaluatePredicate({ kind: 'activeCellInFirstColumn' }, { data, activeKey: null, key: undefined }),
            evaluatePredicate({ kind: 'activeRowHasChildren' }, { data, activeKey: null, key: undefined }),
            evaluatePredicate({ kind: 'activeRowExpanded' }, { data, activeKey: null, key: undefined }),
            evaluatePredicate({ kind: 'activeKeyIsRow' }, { data, activeKey: null, key: undefined }),
          ].map(String).join('|'))
        }}
      >
        Run treegrid helpers
      </button>
      <output>{result}</output>
    </div>
  )
}

describe('listbox and treegrid helper coverage from pointer input', () => {
  it('covers helper guard branches through clicks', () => {
    render(<ListboxTreegridHelperHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Run listbox keys' }))
    expect(screen.getByText('a|a')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Run treegrid helpers' }))
    expect(screen.getByText('row|1|null|false|false|false|false')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Run treegrid navigation' }))
    expect(screen.getByText('null|null|null|null|null|null|row|child|row|row|null|row|row|row|null')).toBeTruthy()

    render(<ListboxRuntimeHost />)
    fireEvent.click(screen.getByRole('button', { name: 'Run listbox runtime' }))
    expect(screen.getByTestId('listbox-runtime').textContent).toContain('a|a|b|edge-option-a|edge-option-b|2|focus:b|select:b')
  })
})
