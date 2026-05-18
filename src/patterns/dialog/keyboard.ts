export const dialogKeyboard = [
  {
    shortcut: 'Escape',
    preventDefault: true,
    cases: [
      { case: 'always', events: [{ type: 'expand', key: '$triggerKey', expanded: false }] },
    ],
  },
] as const
