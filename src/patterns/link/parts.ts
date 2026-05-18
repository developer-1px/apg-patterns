export const linkParts = {
  link: {
    role: 'link',
    aria: [
      { attribute: 'aria-label', from: 'items.label' },
      { attribute: 'aria-disabled', from: 'state.disabledKeys' },
    ],
    focus: {
      tabIndex: { when: { kind: 'always' }, value: 0 },
    },
    state: [
      { name: 'active', from: 'state.activeKey' },
      { name: 'disabled', from: 'state.disabledKeys' },
    ],
    events: [
      { event: 'click', events: [{ type: 'activate', key: '$key' }] },
    ],
  },
} as const
