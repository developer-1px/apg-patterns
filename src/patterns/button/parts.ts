export const buttonParts = {
  button: {
    role: 'button',
    aria: [
      { attribute: 'aria-label', from: 'items.label' },
      { attribute: 'aria-pressed', from: 'state.pressedByKey' },
      { attribute: 'aria-disabled', from: 'state.disabledKeys' },
    ],
    focus: {
      tabIndex: { when: { kind: 'always' }, value: 0 },
    },
    state: [
      { name: 'pressed', from: 'state.pressedByKey' },
      { name: 'disabled', from: 'state.disabledKeys' },
    ],
    events: [
      {
        event: 'click',
        when: { kind: 'isPressed', key: '$key' },
        events: [{ type: 'press', key: '$key', pressed: false }, { type: 'activate', key: '$key' }],
      },
      {
        event: 'click',
        when: { kind: 'not', predicate: { kind: 'isPressed', key: '$key' } },
        events: [{ type: 'press', key: '$key', pressed: true }, { type: 'activate', key: '$key' }],
      },
    ],
  },
} as const
