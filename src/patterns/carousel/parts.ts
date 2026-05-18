export const carouselParts = {
  root: {
    role: 'region',
    aria: [
      { attribute: 'aria-roledescription', from: 'options.roledescription' },
      { attribute: 'aria-label', from: 'refs.label' },
    ],
  },
  slide: {
    role: 'group',
    aria: [
      { attribute: 'aria-roledescription', from: 'options.slideRoledescription' },
      { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
      { attribute: 'aria-hidden', from: 'state.inactiveKey' },
    ],
  },
  prev: {
    role: 'button',
    aria: [{ attribute: 'aria-label', from: 'items.label' }],
    events: [{ event: 'click', events: [{ type: 'navigate', direction: 'previous' }] }],
  },
  next: {
    role: 'button',
    aria: [{ attribute: 'aria-label', from: 'items.label' }],
    events: [{ event: 'click', events: [{ type: 'navigate', direction: 'next' }] }],
  },
  playPause: {
    role: 'button',
    aria: [
      { attribute: 'aria-label', from: 'items.label' },
      { attribute: 'aria-pressed', from: 'state.expandedKeys' },
    ],
  },
  picker: {
    role: 'button',
    aria: [
      { attribute: 'aria-label', from: 'items.label' },
      { attribute: 'aria-pressed', from: 'state.selectedKeys' },
    ],
    events: [{ event: 'click', events: [{ type: 'select', key: '$key' }] }],
  },
} as const
