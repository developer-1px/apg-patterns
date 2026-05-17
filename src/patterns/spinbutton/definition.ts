import { PatternDefinitionSchema } from '../../schema'

const change = (direction: string) => ({
  events: [{ type: 'valueStep', key: '$activeKey', direction }],
})

export const spinbuttonDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'spinbutton',
  rootRole: 'spinbutton',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: {
    spinbutton: {
      role: 'spinbutton',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-labelledby', from: 'items.labelledBy' },
        { attribute: 'aria-valuemin', from: 'options.min' },
        { attribute: 'aria-valuemax', from: 'options.max' },
        { attribute: 'aria-valuemin', from: 'items.valuemin' },
        { attribute: 'aria-valuemax', from: 'items.valuemax' },
        { attribute: 'aria-valuenow', from: 'state.valueByKey' },
        { attribute: 'aria-valuetext', from: 'items.valuetext' },
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
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', ...change('increment') }] },
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', ...change('decrement') }] },
    { shortcut: 'PageUp', preventDefault: true, cases: [{ case: 'always', ...change('incrementLarge') }] },
    { shortcut: 'PageDown', preventDefault: true, cases: [{ case: 'always', ...change('decrementLarge') }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', ...change('min') }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', ...change('max') }] },
  ],
})
