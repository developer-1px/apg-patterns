export const toolbarParts = {
  toolbar: {
    role: 'toolbar',
    aria: [
      { attribute: 'aria-label', from: 'refs.label' },
      { attribute: 'aria-orientation', from: 'options.orientation' },
    ],
  },
  item: {
    role: 'button',
    aria: [
      { attribute: 'aria-pressed', from: 'state.pressedByKey' },
      { attribute: 'aria-disabled', from: 'state.disabledKeys' },
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
      { name: 'pressed', from: 'state.pressedByKey' },
      { name: 'disabled', from: 'state.disabledKeys' },
    ],
    events: [
      { event: 'focus', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }] },
      { event: 'click', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }, { type: 'select', key: '$key' }] },
    ],
  },
  control: {
    role: 'group',
    focus: {
      tabIndex: {
        when: { kind: 'always' },
        active: 0,
        inactive: -1,
      },
    },
    state: [
      { name: 'active', from: 'state.activeKey' },
      { name: 'disabled', from: 'state.disabledKeys' },
    ],
    events: [
      { event: 'focus', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }] },
    ],
  },
} as const
