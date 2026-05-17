import { defineAriaSource } from '../../patternKernel'
import { PatternDefinitionSchema } from '../../schema'

defineAriaSource('options.min', (ctx) => ctx.options?.min)
defineAriaSource('options.max', (ctx) => ctx.options?.max)

export const sliderDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'slider',
  rootRole: 'slider',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: {
    slider: {
      role: 'slider',
      keySource: 'relations.rootKeys',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-valuemin', from: 'options.min' },
        { attribute: 'aria-valuemax', from: 'options.max' },
        { attribute: 'aria-valuenow', from: 'state.valueByKey' },
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
        { name: 'value', from: 'state.valueByKey' },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [
    { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'extension', name: 'value-change', key: '$activeKey', payload: { direction: 'increment' } }] }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'extension', name: 'value-change', key: '$activeKey', payload: { direction: 'increment' } }] }] },
    { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'extension', name: 'value-change', key: '$activeKey', payload: { direction: 'decrement' } }] }] },
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'extension', name: 'value-change', key: '$activeKey', payload: { direction: 'decrement' } }] }] },
  ],
})
