export const menubarParts = {
  menubar: {
    role: 'menubar',
    aria: [
      { attribute: 'aria-label', from: 'refs.label' },
      { attribute: 'aria-orientation', from: 'options.orientation' },
    ],
  },
  menuitem: {
    role: 'menuitem',
    aria: [
      { attribute: 'aria-haspopup', from: 'menu.hasPopup' },
      { attribute: 'aria-expanded', from: 'menu.expandedIfHasPopup' },
      { attribute: 'aria-disabled', from: 'state.disabledKeys' },
      { attribute: 'aria-checked', from: 'state.checkedByKey' },
    ],
    focus: {
      tabIndex: { when: { kind: 'always' }, active: 0, inactive: -1 },
    },
    state: [
      { name: 'active', from: 'state.activeKey' },
      { name: 'expanded', from: 'state.expandedKeys' },
      { name: 'disabled', from: 'state.disabledKeys' },
    ],
    events: [
      { event: 'click', events: [{ type: 'focus', key: '$key' }, { type: 'activate', key: '$key' }] },
      { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
    ],
  },
} as const
