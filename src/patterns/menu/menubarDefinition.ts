import { PatternDefinitionSchema } from '../../schema'
import './menuAriaSources'

export const menubarDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'menubar',
  rootRole: 'menubar',
  containedRoles: ['menuitem', 'menuitemcheckbox', 'menuitemradio'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard', 'typeahead'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: {
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
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
      down: { kind: 'firstChild' },
    },
  },
  keyboard: [
    { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
    {
      shortcut: 'ArrowDown',
      preventDefault: true,
      cases: [
        {
          case: 'when',
          when: { kind: 'hasChildren', key: '$activeKey' },
          events: [
            { type: 'expand', key: '$activeKey', expanded: true },
            { type: 'navigate', direction: 'down' },
          ],
        },
      ],
    },
    { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
    { shortcut: 'Space', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
    { shortcut: 'Escape', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'dismiss', key: '$activeKey' }] }] },
  ],
})
