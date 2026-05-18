export const feedParts = {
  feed: {
    role: 'feed',
    aria: [
      { attribute: 'aria-label', from: 'refs.label' },
      { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
    ],
  },
  article: {
    role: 'article',
    aria: [
      { attribute: 'aria-posinset', from: 'state.posInSetByKey' },
      { attribute: 'aria-setsize', from: 'state.setSizeByKey' },
      { attribute: 'aria-labelledby', from: 'items.labelledBy' },
    ],
    focus: {
      tabIndex: { when: { kind: 'always' }, active: 0, inactive: -1 },
    },
    state: [
      { name: 'active', from: 'state.activeKey' },
    ],
    events: [
      { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
    ],
  },
} as const
