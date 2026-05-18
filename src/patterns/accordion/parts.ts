export const accordionParts = {
  accordion: {
    role: 'group',
    aria: [
      { attribute: 'aria-label', from: 'refs.label' },
      { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
    ],
  },
  header: {
    role: 'button',
    aria: [
      { attribute: 'aria-expanded', from: 'state.expandedKeys' },
      { attribute: 'aria-controls', from: 'relations.controlsByKey' },
    ],
    focus: {
      tabIndex: {
        when: { kind: 'always' },
        active: 0,
        inactive: -1,
      },
    },
    state: [
      { name: 'active', from: 'state.activeKey' },
      { name: 'expanded', from: 'state.expandedKeys' },
    ],
    events: [
      { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
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
