export const alertParts = {
  alert: {
    role: 'alert',
    aria: [
      { attribute: 'aria-label', from: 'items.label' },
    ],
    state: [
      { name: 'expanded', from: 'state.expandedKeys' },
    ],
  },
  dismiss: {
    role: 'button',
    aria: [
      { attribute: 'aria-label', from: 'items.label' },
      { attribute: 'aria-controls', from: 'relations.controlsByKey' },
    ],
    events: [
      {
        event: 'click',
        events: [{ type: 'dismiss', key: '$activeKey' }],
      },
    ],
  },
} as const
