export const menuButtonParts = {
  trigger: {
    role: 'button',
    aria: [
      { attribute: 'aria-haspopup', from: 'menu.hasPopup' },
      { attribute: 'aria-expanded', from: 'state.expandedKeys' },
      { attribute: 'aria-controls', from: 'relations.controlsByKey' },
      { attribute: 'aria-label', from: 'items.label' },
    ],
    focus: {
      tabIndex: { when: { kind: 'always' }, value: 0 },
    },
    state: [
      { name: 'expanded', from: 'state.expandedKeys' },
    ],
    events: [
      {
        event: 'click',
        when: { kind: 'isExpanded', key: '$key' },
        events: [{ type: 'expand', key: '$key', expanded: false }],
      },
      {
        event: 'click',
        when: { kind: 'not', predicate: { kind: 'isExpanded', key: '$key' } },
        events: [{ type: 'expand', key: '$key', expanded: true }],
      },
    ],
  },
  menu: {
    role: 'menu',
    aria: [
      { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
      {
        attribute: 'aria-activedescendant',
        from: 'state.activeKey.elementId',
        when: { kind: 'optionEquals', option: 'focusStrategy', value: 'ariaActiveDescendant' },
      },
    ],
  },
  menuitem: {
    role: 'menuitem',
    aria: [
      { attribute: 'aria-disabled', from: 'state.disabledKeys' },
      { attribute: 'aria-checked', from: 'state.checkedByKey' },
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
      { name: 'disabled', from: 'state.disabledKeys' },
    ],
    events: [
      { event: 'focus', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }] },
      { event: 'click', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'activate', key: '$key' }] },
    ],
  },
} as const
