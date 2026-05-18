export const listboxParts = {
  listbox: {
    role: 'listbox',
    aria: [
      { attribute: 'aria-label', from: 'refs.label' },
      { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
      { attribute: 'aria-multiselectable', from: 'options.selectionMode.multiple' },
      { attribute: 'aria-orientation', from: 'options.orientation' },
      {
        attribute: 'aria-activedescendant',
        from: 'state.activeKey.elementId',
        when: { kind: 'optionEquals', option: 'focusStrategy', value: 'ariaActiveDescendant' },
      },
    ],
  },
  option: {
    role: 'option',
    aria: [
      { attribute: 'aria-selected', from: 'state.selectedKeys' },
      { attribute: 'aria-disabled', from: 'state.disabledKeys' },
      { attribute: 'aria-posinset', from: 'state.posInSetByKey' },
      { attribute: 'aria-setsize', from: 'state.setSizeByKey' },
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
      { name: 'selected', from: 'state.selectedKeys' },
      { name: 'disabled', from: 'state.disabledKeys' },
    ],
    events: [
      { event: 'focus', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }] },
      {
        event: 'focus',
        when: { kind: 'all', predicates: [{ kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, { kind: 'optionEquals', option: 'followFocus', value: true }] },
        events: [{ type: 'select', key: '$key' }],
      },
      { event: 'click', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }, { type: 'select', key: '$key' }] },
    ],
  },
} as const
