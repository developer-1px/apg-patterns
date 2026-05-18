export const disclosureKeyboard = [
  {
    shortcut: 'Enter',
    preventDefault: true,
    cases: [
      { case: 'when', when: { kind: 'isExpanded', key: '$activeKey' }, events: [{ type: 'expand', key: '$activeKey', expanded: false }] },
      { case: 'otherwise', events: [{ type: 'expand', key: '$activeKey', expanded: true }] },
    ],
  },
  {
    shortcut: 'Space',
    preventDefault: true,
    cases: [
      { case: 'when', when: { kind: 'isExpanded', key: '$activeKey' }, events: [{ type: 'expand', key: '$activeKey', expanded: false }] },
      { case: 'otherwise', events: [{ type: 'expand', key: '$activeKey', expanded: true }] },
    ],
  },
] as const
