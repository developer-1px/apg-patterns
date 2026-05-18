export const tabsParts = {
  tablist: {
    role: 'tablist',
    aria: [
      { attribute: 'aria-label', from: 'refs.label' },
      { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
      { attribute: 'aria-orientation', from: 'options.orientation' },
    ],
  },
  tab: {
    role: 'tab',
    aria: [
      { attribute: 'aria-selected', from: 'state.selectedKeys' },
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
      { name: 'selected', from: 'state.selectedKeys' },
    ],
    events: [
      { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
      { event: 'click', events: [{ type: 'select', key: '$key' }] },
      { event: 'focus', when: { kind: 'optionEquals', option: 'activationMode', value: 'automatic' }, events: [{ type: 'select', key: '$key' }] },
    ],
  },
  tabpanel: {
    role: 'tabpanel',
    aria: [{ attribute: 'aria-labelledby', from: 'relations.ownerByKey' }],
    focus: {
      tabIndex: {
        when: { kind: 'always' },
        value: 0,
      },
    },
  },
} as const
