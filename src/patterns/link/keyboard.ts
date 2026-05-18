export const linkKeyboard = [
  {
    shortcut: 'Enter',
    preventDefault: true,
    cases: [
      { case: 'always', events: [{ type: 'activate', key: '$activeKey' }] },
    ],
  },
] as const
