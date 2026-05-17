import { describe, expect, it } from 'vitest'
import {
  PatternDataSchema,
  PatternDefinitionSchema,
  PatternEventSchema,
  resolveEventTemplate,
  type PatternData,
} from './index'

describe('APG interface contract', () => {
  it('accepts non-collection APG patterns without relations', () => {
    expect(
      PatternDataSchema.parse({
        items: {
          submit: { label: 'Submit' },
        },
        state: {
          activeKey: 'submit',
          pressedByKey: { submit: false },
          valueByKey: { submit: 'ready' },
        },
        refs: { label: 'Action' },
      }),
    ).toMatchObject({
      items: { submit: { label: 'Submit' } },
      state: { activeKey: 'submit' },
    })
  })

  it('validates optional relation families used by composite APG patterns', () => {
    const data = PatternDataSchema.parse({
      items: {
        row1: { label: 'Row 1' },
        name: { label: 'Name' },
        cell1: { label: 'Ada' },
      },
      relations: {
        rowKeys: ['row1'],
        columnKeys: ['name'],
        cells: [{ rowKey: 'row1', columnKey: 'name', cellKey: 'cell1' }],
        ownerByKey: { cell1: 'row1' },
        controlsByKey: { name: ['cell1'] },
      },
      state: {
        activeKey: 'cell1',
        rowIndexByKey: { row1: 1, cell1: 1 },
        columnIndexByKey: { name: 1, cell1: 1 },
      },
    })

    expect(data.relations?.cells).toEqual([{ rowKey: 'row1', columnKey: 'name', cellKey: 'cell1' }])
    expect(() =>
      PatternDataSchema.parse({
        ...data,
        relations: { ...data.relations, cells: [{ rowKey: 'missing', columnKey: 'name', cellKey: 'cell1' }] },
      }),
    ).toThrow()
  })

  it('keeps APG event vocabulary finite while allowing extension events', () => {
    expect(PatternEventSchema.parse({ type: 'open', key: 'menu', open: true })).toEqual({ type: 'open', key: 'menu', open: true })
    expect(PatternEventSchema.parse({ type: 'check', key: 'agree', checked: 'mixed' })).toEqual({ type: 'check', key: 'agree', checked: 'mixed' })
    expect(PatternEventSchema.parse({ type: 'press', key: 'toggle', pressed: false })).toEqual({ type: 'press', key: 'toggle', pressed: false })
    expect(PatternEventSchema.parse({ type: 'value', key: 'slider', value: 50 })).toEqual({ type: 'value', key: 'slider', value: 50 })
    expect(PatternEventSchema.parse({ type: 'typeahead', query: 'ad' })).toEqual({ type: 'typeahead', query: 'ad' })
    expect(PatternEventSchema.parse({ type: 'dismiss' })).toEqual({ type: 'dismiss' })
    expect(PatternEventSchema.parse({ type: 'extension', name: 'reorder', key: 'row1', payload: { before: 'row2' } })).toEqual({
      type: 'extension',
      name: 'reorder',
      key: 'row1',
      payload: { before: 'row2' },
    })
    expect(() => PatternEventSchema.parse({ type: 'close', key: 'dialog' })).toThrow()
  })

  it('resolves APG and extension event templates without schema edits', () => {
    const data: PatternData = PatternDataSchema.parse({
      items: { menu: { label: 'Menu' }, slider: { label: 'Size' } },
      state: { activeKey: 'menu' },
    })

    expect(resolveEventTemplate({ type: 'open', key: '$activeKey' }, 'menu', data)).toEqual([{ type: 'open', key: 'menu', open: true }])
    expect(resolveEventTemplate({ type: 'value', key: '$key', value: 10 }, 'menu', data, 'slider')).toEqual([{ type: 'value', key: 'slider', value: 10 }])
    expect(resolveEventTemplate({ type: 'dismiss' }, 'menu', data)).toEqual([{ type: 'dismiss' }])
    expect(resolveEventTemplate({ type: 'extension', name: 'announce', payload: { text: 'Moved' } }, 'menu', data)).toEqual([
      { type: 'extension', name: 'announce', payload: { text: 'Moved' } },
    ])
  })

  it('accepts extension APG-compatible pattern definitions with open directions', () => {
    const definition = PatternDefinitionSchema.parse({
      apgPattern: 'extension-toolbar-grid',
      rootRole: 'grid',
      containedRoles: ['row', 'gridcell', 'button'],
      focusModel: 'ariaActiveDescendant',
      parts: {
        root: {
          role: 'grid',
          keySource: 'relations.rowKeys',
          aria: [{ attribute: 'aria-label', from: 'refs.label' }],
        },
        cell: {
          role: 'gridcell',
          keySource: 'relations.cells.cellKey',
          events: [{ event: 'click', events: [{ type: 'extension', name: 'invokeCell', key: '$key' }] }],
        },
      },
      navigation: {
        visibleOrder: { kind: 'extensionCells' },
        targets: {
          pageDownWithinSection: { kind: 'extensionGrid', action: 'pageDownWithinSection' },
        },
      },
      keyboard: [
        {
          shortcut: 'PageDown',
          preventDefault: true,
          cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'pageDownWithinSection' }] }],
        },
      ],
    })

    expect(definition.keyboard[0]?.cases[0]?.events).toEqual([{ type: 'navigate', direction: 'pageDownWithinSection' }])
  })
})
