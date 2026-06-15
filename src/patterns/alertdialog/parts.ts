export const alertDialogParts = {
  trigger: {
    role: 'button',
    aria: [
      { attribute: 'aria-expanded', from: 'state.expandedKeys' },
      { attribute: 'aria-controls', from: 'relations.controlsByKey' },
      { attribute: 'aria-haspopup', from: 'items.kind' },
    ],
    events: [
      {
        event: 'click',
        when: { kind: 'not', predicate: { kind: 'isExpanded', key: '$key' } },
        events: [{ type: 'expand', key: '$key', expanded: true }],
      },
    ],
  },
  dialog: {
    role: 'alertdialog',
    aria: [
      { attribute: 'aria-modal', from: 'literal.true' },
      { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
      { attribute: 'aria-describedby', from: 'relations.controlsByKey' },
    ],
  },
  title: { role: 'heading' },
  description: { role: 'paragraph' },
  confirm: {
    role: 'button',
    events: [
      {
        event: 'click',
        events: [{ type: 'expand', key: '$triggerKey', expanded: false }],
      },
    ],
  },
  cancel: {
    role: 'button',
    events: [
      {
        event: 'click',
        events: [{ type: 'expand', key: '$triggerKey', expanded: false }],
      },
    ],
  },
} as const
