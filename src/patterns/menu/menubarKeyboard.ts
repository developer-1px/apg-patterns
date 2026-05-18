export const menubarKeyboard = [
  { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }] },
  { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'previous' }] }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
  {
    shortcut: 'ArrowDown',
    preventDefault: true,
    cases: [
      {
        case: 'when',
        when: { kind: 'hasChildren', key: '$activeKey' },
        events: [
          { type: 'expand', key: '$activeKey', expanded: true },
          { type: 'navigate', direction: 'down' },
        ],
      },
    ],
  },
  { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
  { shortcut: 'Space', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
  { shortcut: 'Escape', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'dismiss', key: '$activeKey' }] }] },
] as const
