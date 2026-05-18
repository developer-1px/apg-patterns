export const tableParts = {
  table: {
    role: 'table',
    aria: [
      { attribute: 'aria-label', from: 'refs.label' },
      { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
      { attribute: 'aria-rowcount', from: 'state.rowCount' },
      { attribute: 'aria-colcount', from: 'state.colCount' },
    ],
  },
  row: {
    role: 'row',
    aria: [{ attribute: 'aria-rowindex', from: 'state.rowIndexByKey' }],
  },
  columnheader: {
    role: 'columnheader',
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
    aria: [
      { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
      { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
    ],
  },
  cell: {
    role: 'cell',
    aria: [
      { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
      { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
    ],
  },
} as const
