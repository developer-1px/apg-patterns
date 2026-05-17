import { PatternDefinitionSchema } from '../../schema'
import { defineAriaSource, isRegisteredAriaSource } from '../../patternKernel'

// Static (non-interactive) table per APG: role=table with rows containing
// columnheader / rowheader / cell. No focus/navigation — sortable lives in grid.
// Reuse rowCount/colCount sources if already registered (e.g. by grid).
if (!isRegisteredAriaSource('state.rowCount')) {
  defineAriaSource('state.rowCount', (ctx) => (ctx.data.state as { rowCount?: number } | undefined)?.rowCount ?? ctx.data.relations?.rowKeys?.length)
}
if (!isRegisteredAriaSource('state.colCount')) {
  defineAriaSource('state.colCount', (ctx) => (ctx.data.state as { colCount?: number } | undefined)?.colCount ?? ctx.data.relations?.columnKeys?.length)
}

export const tableDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'table',
  rootRole: 'table',
  containedRoles: ['row', 'columnheader', 'rowheader', 'cell'],
  parts: {
    table: {
      role: 'table',
      keySource: 'relations.rowKeys',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
        { attribute: 'aria-rowcount', from: 'state.rowCount' },
        { attribute: 'aria-colcount', from: 'state.colCount' },
      ],
    },
    row: {
      role: 'row',
      keySource: 'relations.rowKeys',
      aria: [{ attribute: 'aria-rowindex', from: 'state.rowIndexByKey' }],
    },
    columnheader: {
      role: 'columnheader',
      keySource: 'columnHeaderKey',
      aria: [
        { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
        { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
        { attribute: 'aria-sort', from: 'state.sortByKey' },
      ],
      events: [
        { event: 'click', events: [{ type: 'activate', key: '$key' }] },
      ],
    },
    rowheader: {
      role: 'rowheader',
      keySource: 'rowHeaderKey',
      aria: [
        { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
        { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
      ],
    },
    cell: {
      role: 'cell',
      keySource: 'tableCellKey',
      aria: [
        { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
        { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [],
})
