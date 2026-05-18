const itemIsDisabled = { kind: 'isDisabled', key: '$key' } as const
const itemClickSelect = { kind: 'optionEquals', option: 'itemClickAction', value: 'select' } as const
const itemClickToggleExpand = { kind: 'optionEquals', option: 'itemClickAction', value: 'toggleExpand' } as const
const indicatorClickToggleExpand = { kind: 'optionEquals', option: 'indicatorClickAction', value: 'toggleExpand' } as const

export const treeviewParts = {
  tree: {
    role: 'tree',
    aria: [
      { attribute: 'aria-label', from: 'refs.label' },
      { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
      { attribute: 'aria-multiselectable', from: 'options.selectionMode.multiple' },
      {
        attribute: 'aria-activedescendant',
        from: 'state.activeKey.elementId',
        when: { kind: 'optionEquals', option: 'focusStrategy', value: 'ariaActiveDescendant' },
      },
    ],
    focus: {
      tabIndex: {
        when: { kind: 'optionEquals', option: 'focusStrategy', value: 'ariaActiveDescendant' },
        value: 0,
      },
    },
  },
  treeitem: {
    role: 'treeitem',
    aria: [
      { attribute: 'aria-label', from: 'items.label' },
      { attribute: 'aria-labelledby', from: 'items.labelledBy' },
      { attribute: 'aria-selected', from: 'state.selectedKeys' },
      { attribute: 'aria-disabled', from: 'state.disabledKeys' },
      { attribute: 'aria-expanded', from: 'state.expandedKeys', when: { kind: 'hasChildren', key: '$key' } },
      { attribute: 'aria-checked', from: 'state.checkedByKey' },
      { attribute: 'aria-level', from: 'state.levelByKey' },
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
      { name: 'expanded', from: 'state.expandedKeys' },
      { name: 'checked', from: 'state.checkedByKey' },
    ],
    events: [
      { event: 'focus', when: { kind: 'not', predicate: itemIsDisabled }, events: [{ type: 'focus', key: '$key' }] },
      { event: 'click', when: { kind: 'not', predicate: itemIsDisabled }, events: [{ type: 'focus', key: '$key' }] },
      {
        event: 'click',
        when: { kind: 'all', predicates: [{ kind: 'not', predicate: itemIsDisabled }, itemClickSelect] },
        events: [{ type: 'select', key: '$key' }],
      },
      {
        event: 'click',
        when: { kind: 'all', predicates: [{ kind: 'not', predicate: itemIsDisabled }, { kind: 'hasChildren', key: '$key' }, itemClickToggleExpand] },
        events: [{ type: 'expand', key: '$key' }],
      },
      {
        event: 'focus',
        when: { kind: 'all', predicates: [{ kind: 'not', predicate: itemIsDisabled }, { kind: 'optionEquals', option: 'followFocus', value: true }] },
        events: [{ type: 'select', key: '$key' }],
      },
    ],
  },
  indicator: {
    role: 'presentation',
    events: [
      {
        event: 'click',
        when: { kind: 'all', predicates: [{ kind: 'not', predicate: itemIsDisabled }, { kind: 'hasChildren', key: '$key' }, indicatorClickToggleExpand] },
        events: [
          { type: 'focus', key: '$key' },
          { type: 'expand', key: '$key' },
        ],
      },
    ],
  },
} as const
