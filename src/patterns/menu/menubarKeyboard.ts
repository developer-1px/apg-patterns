const activeItemEnabled = { kind: 'not', predicate: { kind: 'isDisabled', key: '$activeKey' } } as const
const activeItemWithChildren = { kind: 'all', predicates: [{ kind: 'hasChildren', key: '$activeKey' }, activeItemEnabled] } as const

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
        when: activeItemWithChildren,
        events: [
          { type: 'expand', key: '$activeKey', expanded: true },
          { type: 'navigate', direction: 'down' },
        ],
      },
    ],
  },
  { shortcut: 'Enter', preventDefault: true, cases: activeItemCases([{ type: 'activate', key: '$activeKey' }]) },
  { shortcut: 'Space', preventDefault: true, cases: activeItemCases([{ type: 'activate', key: '$activeKey' }]) },
  { shortcut: 'Escape', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'dismiss', key: '$activeKey' }] }] },
] as const

function activeItemCases(events: readonly unknown[]) {
  return [{ case: 'when', when: activeItemEnabled, events }]
}
