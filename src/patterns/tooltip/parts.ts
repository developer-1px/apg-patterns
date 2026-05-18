export const tooltipParts = {
  trigger: {
    role: 'button',
    aria: [
      { attribute: 'aria-describedby', from: 'relations.controlsByKey' },
      { attribute: 'aria-label', from: 'items.label' },
    ],
    focus: {
      tabIndex: { when: { kind: 'always' }, value: 0 },
    },
    events: [
      { event: 'focus', events: [{ type: 'expand', key: '$key', expanded: true }] },
      { event: 'blur', events: [{ type: 'expand', key: '$key', expanded: false }] },
      { event: 'mouseenter', events: [{ type: 'expand', key: '$key', expanded: true }] },
      { event: 'mouseleave', events: [{ type: 'expand', key: '$key', expanded: false }] },
    ],
  },
  tooltip: {
    role: 'tooltip',
    aria: [
      { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
    ],
  },
} as const
