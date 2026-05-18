export const tooltipKeyboard = [
  {
    shortcut: 'Escape',
    preventDefault: true,
    cases: [
      { case: 'always', events: [{ type: 'expand', key: '$activeKey', expanded: false }] },
    ],
  },
] as const
