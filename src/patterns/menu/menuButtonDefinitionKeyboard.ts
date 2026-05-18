const activeItemCases = (events: readonly unknown[]) => [
  { case: 'when', when: { kind: 'hasActiveKey' }, events },
] as const

export const menuButtonDefinitionKeyboard = [
  { shortcut: 'ArrowDown', preventDefault: true, cases: activeItemCases([{ type: 'navigate', direction: 'next' }]) },
  { shortcut: 'ArrowUp', preventDefault: true, cases: activeItemCases([{ type: 'navigate', direction: 'previous' }]) },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
  { shortcut: 'Enter', preventDefault: true, cases: activeItemCases([{ type: 'activate', key: '$activeKey' }, { type: 'dismiss' }]) },
  { shortcut: 'Space', preventDefault: true, cases: activeItemCases([{ type: 'activate', key: '$activeKey' }, { type: 'dismiss' }]) },
  { shortcut: 'Escape', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'dismiss' }] }] },
] as const
