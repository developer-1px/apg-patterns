import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { evaluatePredicate, type PatternData, type PatternEvent } from '../index'
import { handleListboxMultiKeyDown } from '../patterns/listbox/handleListboxMultiKeyDown'
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
  })
})
