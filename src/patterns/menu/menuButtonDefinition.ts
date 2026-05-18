import { PatternDefinitionSchema } from '../../schema'
import './menuAriaSources'

export const menuButtonDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'menu-button',
  rootRole: 'button',
  containedRoles: ['menu', 'menuitem', 'menuitemcheckbox', 'menuitemradio'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard', 'typeahead', 'open'] }, scope: { kind: 'always' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: {
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
        { attribute: 'aria-activedescendant', from: 'state.activeKey.elementId' },
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
        { event: 'click', when: { kind: 'not', predicate: { kind: 'isDisabled', key: '$key' } }, events: [{ type: 'activate', key: '$key' }, { type: 'dismiss' }] },
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
    { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'activate', key: '$activeKey' }, { type: 'dismiss' }] }] },
    { shortcut: 'Space', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'activate', key: '$activeKey' }, { type: 'dismiss' }] }] },
    { shortcut: 'Escape', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'dismiss' }] }] },
  ],
})
