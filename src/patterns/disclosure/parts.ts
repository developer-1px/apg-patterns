export const disclosureParts = {
  trigger: {
    role: 'button',
    aria: [
      { attribute: 'aria-expanded', from: 'state.expandedKeys' },
      { attribute: 'aria-controls', from: 'relations.controlsByKey' },
      { attribute: 'aria-label', from: 'items.label' },
    ],
    focus: {
      tabIndex: { when: { kind: 'always' }, value: 0 },
    },
    state: [
      { name: 'active', from: 'state.activeKey' },
      { name: 'expanded', from: 'state.expandedKeys' },
    ],
    events: [
      {
        event: 'click',
        when: { kind: 'isExpanded', key: '$key' },
        events: [{ type: 'expand', key: '$key', expanded: false }],
      },
      {
        event: 'click',
        when: { kind: 'not', predicate: { kind: 'isExpanded', key: '$key' } },
        events: [{ type: 'expand', key: '$key', expanded: true }],
      },
    ],
  },
  panel: {
    role: 'region',
    aria: [
      { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
    ],
  },
} as const
