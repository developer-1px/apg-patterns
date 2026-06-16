const activeItemEnabled = { kind: 'not', predicate: { kind: 'isDisabled', key: '$activeKey' } } as const
const activeItemWithChildren = { kind: 'all', predicates: [{ kind: 'hasChildren', key: '$activeKey' }, activeItemEnabled] } as const
const activateActiveItemCases = [
  { case: 'when', when: activeItemEnabled, events: [{ type: 'activate', key: '$activeKey' }] },
] as const

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
  { shortcut: 'Enter', preventDefault: true, cases: activateActiveItemCases },
  { shortcut: 'Space', preventDefault: true, cases: activateActiveItemCases },
  { shortcut: 'Escape', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'dismiss', key: '$activeKey' }] }] },
] as const
