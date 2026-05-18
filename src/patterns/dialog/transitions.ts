export const dialogTransitions = [
  {
    on: 'expand',
    actions: [
      { kind: 'set', field: 'activeKey', value: { from: '$event.key' } },
      {
        kind: 'setMembership',
        field: 'expandedKeys',
        value: { from: '$event.key' },
        present: { from: '$event.expanded' },
      },
    ],
  },
] as const
