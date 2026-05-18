export const dialogParts = {
  trigger: {
    role: 'button',
    aria: [
      { attribute: 'aria-haspopup', from: 'items.kind' },
      { attribute: 'aria-expanded', from: 'state.expandedKeys' },
      { attribute: 'aria-controls', from: 'relations.controlsByKey' },
    ],
    events: [
      { event: 'click', events: [{ type: 'expand', key: '$key', expanded: true }] },
    ],
  },
  dialog: {
    role: 'dialog',
    aria: [
      { attribute: 'aria-modal', from: 'literal.true' },
      { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
      { attribute: 'aria-describedby', from: 'relations.controlsByKey' },
    ],
  },
  overlay: {
    role: 'presentation',
    events: [{ event: 'mousedown', events: [{ type: 'expand', key: '$triggerKey', expanded: false }] }],
  },
  title: { role: 'heading' },
  description: { role: 'paragraph' },
  cancel: {
    role: 'button',
    events: [{ event: 'click', events: [{ type: 'expand', key: '$triggerKey', expanded: false }] }],
  },
  submit: {
    role: 'button',
    events: [{ event: 'click', events: [{ type: 'expand', key: '$triggerKey', expanded: false }] }],
  },
} as const
