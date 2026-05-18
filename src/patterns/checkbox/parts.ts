export const checkboxParts = {
  checkbox: {
    role: 'checkbox',
    aria: [
      { attribute: 'aria-label', from: 'items.label' },
      { attribute: 'aria-checked', from: 'state.checkedByKey' },
      { attribute: 'aria-disabled', from: 'state.disabledKeys' },
    ],
    focus: {
      tabIndex: { when: { kind: 'always' }, value: 0 },
    },
    state: [
      { name: 'checked', from: 'state.checkedByKey' },
      { name: 'disabled', from: 'state.disabledKeys' },
    ],
    events: [
      {
        event: 'click',
        when: { kind: 'isChecked', key: '$key' },
        events: [{ type: 'check', key: '$key', checked: false }],
      },
      {
        event: 'click',
        when: { kind: 'not', predicate: { kind: 'isChecked', key: '$key' } },
        events: [{ type: 'check', key: '$key', checked: true }],
      },
    ],
  },
} as const
