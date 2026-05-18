import { PatternDefinitionSchema } from '../../schema'

export const listboxDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'listbox',
  rootRole: 'listbox',
  containedRoles: ['option'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard', 'typeahead'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: {
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
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: [
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
    { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'select', key: '$activeKey' }] }] },
    { shortcut: 'Space', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'select', key: '$activeKey' }] }] },
  ],
  react: {
    hook: 'useListboxPattern',
    root: { prop: 'rootProps', part: 'listbox', element: 'div' },
    renderItems: {
      name: 'renderItems',
      source: { kind: 'visibleOrder' },
      order: 'flat',
      variants: [
        {
          kind: 'option',
          when: { kind: 'always' },
          fields: {
            key: { kind: 'key' },
            kind: { kind: 'literal', value: 'option' },
            label: { kind: 'itemField', field: 'label', fallback: 'key' },
            textValue: { kind: 'textValue', fallback: 'label' },
            state: { kind: 'partState', part: 'option' },
          },
          props: {
            optionProps: { part: 'option', element: 'div', owner: 'item' },
          },
        },
      ],
    },
  },
})
