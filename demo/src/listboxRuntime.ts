import {
  PatternDataSchema,
  PatternDefinitionSchema,
  defineVisibleOrder,
} from '../../src'

defineVisibleOrder('flat', (_visibleOrder, data) => data.relations?.rootKeys ?? [])

export const listboxDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'listbox',
  rootRole: 'listbox',
  containedRoles: ['option'],
  focusModel: 'rovingTabIndex',
  parts: {
    listbox: {
      role: 'listbox',
      keySource: 'relations.rootKeys',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-multiselectable', from: 'options.selectionMode.multiple' },
      ],
    },
    option: {
      role: 'option',
      keySource: 'collectionItemKey',
      aria: [
        { attribute: 'aria-selected', from: 'state.selectedKeys' },
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
        { name: 'selected', from: 'state.selectedKeys' },
        { name: 'disabled', from: 'state.disabledKeys' },
      ],
      events: [
        { event: 'focus', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'focus', key: '$key' }] },
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
  ],
})

export const initialListboxData = PatternDataSchema.parse({
  items: {
    a: { label: 'Apple' },
    b: { label: 'Banana' },
    c: { label: 'Cherry' },
  },
  relations: {
    rootKeys: ['a', 'b', 'c'],
    childrenByKey: { a: [], b: [], c: [] },
  },
  state: {
    activeKey: 'b',
    selectedKeys: ['b'],
  },
  refs: { label: 'Fruits' },
})
