export const radioParts = {
  radiogroup: {
    role: 'radiogroup',
    aria: [{ attribute: 'aria-label', from: 'refs.label' }],
  },
  radio: {
    role: 'radio',
    aria: [
      { attribute: 'aria-checked', from: 'state.selectedKeys.radioChecked' },
      { attribute: 'aria-disabled', from: 'state.disabledKeys' },
    ],
    focus: {
      tabIndex: {
        when: { kind: 'optionEquals', option: 'focusStrategy', value: 'rovingTabIndex' },
        active: 0,
        inactive: -1,
      },
    },
    state: [
      { name: 'active', from: 'state.activeKey' },
      { name: 'checked', from: 'state.selectedKeys.radioChecked' },
      { name: 'disabled', from: 'state.disabledKeys' },
    ],
    events: [
      { event: 'focus', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }] },
      { event: 'click', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }, { type: 'select', key: '$key' }] },
    ],
  },
} as const
