import { describe, expect, it } from 'vitest'
import type { PatternData, PatternEvent } from '../index'
import { createGridRuntimeEventHandler } from '../patterns/grid/gridRuntimeEvents'

const gridData = {
  items: {
    name: { label: 'Name', kind: 'columnheader' },
    value: { label: 'Value' },
  },
  relations: {},
  state: {},
} satisfies PatternData

describe('grid columnheader activation', () => {
  it('passes through activation for non-sortable column headers', () => {
    const events: PatternEvent[] = []
    const handle = createGridRuntimeEventHandler({
      data: gridData,
      editableKeys: [],
      editingKey: null,
      valueByKey: {},
      sortByKey: {},
      onEvent: (event) => events.push(event),
    })

    handle({ type: 'activate', key: 'name' })

    expect(events).toEqual([{ type: 'activate', key: 'name' }])
  })

  it('toggles sort for column headers declared in sortByKey', () => {
    const events: PatternEvent[] = []
    const handle = createGridRuntimeEventHandler({
      data: gridData,
      editableKeys: [],
      editingKey: null,
      valueByKey: {},
      sortByKey: { name: 'ascending' },
      onEvent: (event) => events.push(event),
    })

    handle({ type: 'activate', key: 'name' })

    expect(events).toEqual([{ type: 'sort', key: 'name', sort: 'descending' }])
  })

  it('sets ascending sort for sortable column headers without current sort', () => {
    const events: PatternEvent[] = []
    const handle = createGridRuntimeEventHandler({
      data: { ...gridData, items: { ...gridData.items, name: { ...gridData.items.name, sortable: true } } },
      editableKeys: [],
      editingKey: null,
      valueByKey: {},
      sortByKey: {},
      onEvent: (event) => events.push(event),
    })

    handle({ type: 'activate', key: 'name' })

    expect(events).toEqual([{ type: 'sort', key: 'name', sort: 'ascending' }])
  })
})
