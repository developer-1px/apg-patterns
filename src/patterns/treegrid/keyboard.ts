import type { KeyboardBinding } from '../../schema'

const activeCellInFirstColumn = { kind: 'activeCellInFirstColumn' } as const
const activeRowHasChildren = { kind: 'activeRowHasChildren' } as const
const activeRowExpanded = { kind: 'activeRowExpanded' } as const
const activeKeyIsRow = { kind: 'activeKeyIsRow' } as const

export const treegridKeyboard = [
  { shortcut: 'ArrowRight', preventDefault: true, cases: [
    {
      case: 'when',
      when: { kind: 'all', predicates: [activeKeyIsRow, activeRowHasChildren, { kind: 'not', predicate: activeRowExpanded }] },
      events: [{ type: 'expandActiveRow', expanded: true }, { type: 'focus', key: '$activeKey' }],
    },
    {
      case: 'when',
      when: { kind: 'all', predicates: [activeCellInFirstColumn, activeRowHasChildren, { kind: 'not', predicate: activeRowExpanded }] },
      events: [{ type: 'expandActiveRow', expanded: true }],
    },
    { case: 'when', when: activeKeyIsRow, events: [] },
    { case: 'otherwise', events: [{ type: 'navigate', direction: 'right' }] },
  ] },
  { shortcut: 'ArrowLeft', preventDefault: true, cases: [
    {
      case: 'when',
      when: { kind: 'all', predicates: [activeKeyIsRow, activeRowHasChildren, activeRowExpanded] },
      events: [{ type: 'expandActiveRow', expanded: false }, { type: 'focus', key: '$activeKey' }],
    },
    {
      case: 'when',
      when: { kind: 'all', predicates: [activeCellInFirstColumn, activeRowHasChildren, activeRowExpanded] },
      events: [{ type: 'expandActiveRow', expanded: false }],
    },
    {
      case: 'when',
      when: activeCellInFirstColumn,
      events: [{ type: 'navigate', direction: 'parentRow' }],
    },
    { case: 'when', when: activeKeyIsRow, events: [] },
    { case: 'otherwise', events: [{ type: 'navigate', direction: 'left' }] },
  ] },
  { shortcut: 'ArrowDown', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [{ type: 'navigate', direction: 'rowDown' }] },
    { case: 'otherwise', events: [{ type: 'navigate', direction: 'down' }] },
  ] },
  { shortcut: 'ArrowUp', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [{ type: 'navigate', direction: 'rowUp' }] },
    { case: 'otherwise', events: [{ type: 'navigate', direction: 'up' }] },
  ] },
  { shortcut: 'Home', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [{ type: 'navigate', direction: 'rowGridStart' }] },
    { case: 'otherwise', events: [{ type: 'navigate', direction: 'rowStart' }] },
  ] },
  { shortcut: 'End', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [{ type: 'navigate', direction: 'rowGridEnd' }] },
    { case: 'otherwise', events: [{ type: 'navigate', direction: 'rowEnd' }] },
  ] },
  { shortcut: 'Control+Home', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [{ type: 'navigate', direction: 'rowGridStart' }] },
    { case: 'otherwise', events: [{ type: 'navigate', direction: 'gridStart' }] },
  ] },
  { shortcut: 'Control+End', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [{ type: 'navigate', direction: 'rowGridEnd' }] },
    { case: 'otherwise', events: [{ type: 'navigate', direction: 'gridEnd' }] },
  ] },
  { shortcut: 'Control+a', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'selectAll' }] }] },
  { shortcut: 'Control+Space', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [{ type: 'selectAll' }] },
    { case: 'otherwise', events: [{ type: 'selectColumn' }] },
  ] },
  { shortcut: 'Shift+Space', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'selectRow' }] }] },
  { shortcut: 'Shift+ArrowRight', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [] },
    { case: 'otherwise', events: [{ type: 'extendSelection', direction: 'right' }] },
  ] },
  { shortcut: 'Shift+ArrowLeft', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [] },
    { case: 'otherwise', events: [{ type: 'extendSelection', direction: 'left' }] },
  ] },
  { shortcut: 'Shift+ArrowDown', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [{ type: 'extendSelection', direction: 'rowDown' }] },
    { case: 'otherwise', events: [{ type: 'extendSelection', direction: 'down' }] },
  ] },
  { shortcut: 'Shift+ArrowUp', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [{ type: 'extendSelection', direction: 'rowUp' }] },
    { case: 'otherwise', events: [{ type: 'extendSelection', direction: 'up' }] },
  ] },
  { shortcut: 'Shift+Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'extendSelection', direction: 'rowStart' }] }] },
  { shortcut: 'Shift+End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'extendSelection', direction: 'rowEnd' }] }] },
  { shortcut: 'PageDown', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [{ type: 'navigate', direction: 'rowPageDown' }] },
    { case: 'otherwise', events: [{ type: 'navigate', direction: 'pageDown' }] },
  ] },
  { shortcut: 'PageUp', preventDefault: true, cases: [
    { case: 'when', when: activeKeyIsRow, events: [{ type: 'navigate', direction: 'rowPageUp' }] },
    { case: 'otherwise', events: [{ type: 'navigate', direction: 'pageUp' }] },
  ] },
  { shortcut: 'Enter', preventDefault: true, cases: [
    {
      case: 'when',
      when: { kind: 'all', predicates: [activeKeyIsRow, activeRowHasChildren, { kind: 'not', predicate: activeRowExpanded }] },
      events: [{ type: 'expandActiveRow', expanded: true }, { type: 'focus', key: '$activeKey' }],
    },
    {
      case: 'when',
      when: { kind: 'all', predicates: [activeKeyIsRow, activeRowHasChildren, activeRowExpanded] },
      events: [{ type: 'expandActiveRow', expanded: false }, { type: 'focus', key: '$activeKey' }],
    },
    {
      case: 'when',
      when: { kind: 'all', predicates: [activeCellInFirstColumn, activeRowHasChildren, { kind: 'not', predicate: activeRowExpanded }] },
      events: [{ type: 'expandActiveRow', expanded: true }],
    },
    {
      case: 'when',
      when: { kind: 'all', predicates: [activeCellInFirstColumn, activeRowHasChildren, activeRowExpanded] },
      events: [{ type: 'expandActiveRow', expanded: false }],
    },
    { case: 'otherwise', events: [{ type: 'activate', key: '$activeKey' }] },
  ] },
] satisfies readonly KeyboardBinding[]
