import type { KeyboardBinding } from '../../schema'

export const accordionKeyboard = [
  { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'next' }] }] },
  { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
  {
    shortcut: 'Enter',
    preventDefault: true,
    cases: [
      { case: 'when', when: { kind: 'isExpanded', key: '$activeKey' }, events: [{ type: 'expand', key: '$activeKey', expanded: false }] },
      { case: 'otherwise', events: [{ type: 'expand', key: '$activeKey', expanded: true }] },
    ],
  },
  {
    shortcut: 'Space',
    preventDefault: true,
    cases: [
      { case: 'when', when: { kind: 'isExpanded', key: '$activeKey' }, events: [{ type: 'expand', key: '$activeKey', expanded: false }] },
      { case: 'otherwise', events: [{ type: 'expand', key: '$activeKey', expanded: true }] },
    ],
  },
] satisfies readonly KeyboardBinding[]
