import { defineAriaSource, defineStateProjection } from '../../patternKernel'
import { PatternDefinitionSchema } from '../../schema'

defineAriaSource('state.selectedKeys.radioChecked', (ctx) => (ctx.key ? ctx.data.state?.selectedKeys?.includes(ctx.key) ?? false : undefined))
defineStateProjection('state.selectedKeys.radioChecked', (ctx) => (ctx.key ? ctx.data.state?.selectedKeys?.includes(ctx.key) ?? false : false))

const radioFocus = {
  tabIndex: {
    when: { kind: 'optionEquals', option: 'focusStrategy', value: 'rovingTabIndex' },
    active: 0,
    inactive: -1,
  },
} as const

export const radioGroupDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'radio',
  rootRole: 'radiogroup',
  containedRoles: ['radio'],
  focusModel: 'rovingTabIndex',
  parts: {
    radiogroup: {
      role: 'radiogroup',
      keySource: 'relations.rootKeys',
      aria: [{ attribute: 'aria-label', from: 'refs.label' }],
    },
    radio: {
      role: 'radio',
      keySource: 'collectionItemKey',
      aria: [
        { attribute: 'aria-checked', from: 'state.selectedKeys.radioChecked' },
        { attribute: 'aria-disabled', from: 'state.disabledKeys' },
      ],
      focus: radioFocus,
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'checked', from: 'state.selectedKeys.radioChecked' },
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
    { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
    { shortcut: 'Space', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'select', key: '$activeKey' }] }] },
  ],
})
