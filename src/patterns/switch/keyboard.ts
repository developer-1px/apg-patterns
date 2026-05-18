const toggleSwitchCases = [
  { case: 'when', when: { kind: 'isSwitchOn', key: '$activeKey' }, events: [{ type: 'check', key: '$activeKey', checked: false }] },
  { case: 'otherwise', events: [{ type: 'check', key: '$activeKey', checked: true }] },
] as const

export const switchKeyboard = [
  {
    shortcut: 'Space',
    preventDefault: true,
    cases: toggleSwitchCases,
  },
  {
    shortcut: 'Enter',
    preventDefault: true,
    cases: toggleSwitchCases,
  },
] as const
