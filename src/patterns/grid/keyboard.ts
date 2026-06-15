import type { KeyboardBinding } from '../../schema'

const multipleSelection = { kind: 'optionEquals', option: 'selectionMode', value: 'multiple' } as const

export const gridKeyboard = [
  { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'right' }] }] },
  { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'left' }] }] },
  { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'down' }] }] },
  { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'up' }] }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'rowStart' }] }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'rowEnd' }] }] },
  { shortcut: 'Control+Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'gridStart' }] }] },
  { shortcut: 'Control+End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'gridEnd' }] }] },
  { shortcut: 'PageUp', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'pageUp' }] }] },
  { shortcut: 'PageDown', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'pageDown' }] }] },
  { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
  { shortcut: 'F2', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
  { shortcut: 'Escape', preventDefault: false, cases: [{ case: 'always', events: [{ type: 'dismiss', key: '$activeKey' }] }] },
  { shortcut: 'Control+a', preventDefault: true, cases: [{ case: 'when', when: multipleSelection, events: [{ type: 'selectAll' }] }] },
  { shortcut: 'Control+Space', preventDefault: true, cases: [{ case: 'when', when: multipleSelection, events: [{ type: 'selectColumn' }] }] },
  { shortcut: 'Shift+Space', preventDefault: true, cases: [{ case: 'when', when: multipleSelection, events: [{ type: 'selectRow' }] }] },
  { shortcut: 'Shift+ArrowRight', preventDefault: true, cases: [{ case: 'when', when: multipleSelection, events: [{ type: 'extendSelection', direction: 'right' }] }] },
  { shortcut: 'Shift+ArrowLeft', preventDefault: true, cases: [{ case: 'when', when: multipleSelection, events: [{ type: 'extendSelection', direction: 'left' }] }] },
  { shortcut: 'Shift+ArrowDown', preventDefault: true, cases: [{ case: 'when', when: multipleSelection, events: [{ type: 'extendSelection', direction: 'down' }] }] },
  { shortcut: 'Shift+ArrowUp', preventDefault: true, cases: [{ case: 'when', when: multipleSelection, events: [{ type: 'extendSelection', direction: 'up' }] }] },
  { shortcut: 'Shift+Home', preventDefault: true, cases: [{ case: 'when', when: multipleSelection, events: [{ type: 'extendSelection', direction: 'rowStart' }] }] },
  { shortcut: 'Shift+End', preventDefault: true, cases: [{ case: 'when', when: multipleSelection, events: [{ type: 'extendSelection', direction: 'rowEnd' }] }] },
] satisfies readonly KeyboardBinding[]
