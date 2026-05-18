export const checkboxKeyboard = [
  {
    shortcut: 'Space',
    preventDefault: true,
    cases: [
      { case: 'when', when: { kind: 'isChecked', key: '$activeKey' }, events: [{ type: 'check', key: '$activeKey', checked: false }] },
      { case: 'otherwise', events: [{ type: 'check', key: '$activeKey', checked: true }] },
    ],
  },
] as const
