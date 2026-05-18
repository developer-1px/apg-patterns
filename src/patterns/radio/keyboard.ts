export const radioKeyboard = [
  { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }] },
  { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }] },
  { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'previous' }] }] },
  { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'previous' }] }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
  { shortcut: 'Space', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'select', key: '$activeKey' }] }] },
] as const
