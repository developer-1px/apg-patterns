export const alertKeyboard = [
  {
    shortcut: 'Escape',
    preventDefault: true,
    cases: [
      { case: 'always', events: [{ type: 'dismiss', key: '$activeKey' }] },
    ],
  },
] as const
