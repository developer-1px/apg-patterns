import { PatternDefinitionSchema } from '../../schema'

// Reuses kernel/slider aria sources:
//   options.min / options.max / options.orientation
//   state.valueByKey
//   items.label / items.labelledBy
//   relations.controlsByKey

const change = (direction: string) => ({
  events: [{ type: 'extension', name: 'value-change', key: '$activeKey', payload: { direction } }],
})

const collapse = {
  events: [{ type: 'extension', name: 'collapse-toggle', key: '$activeKey' }],
}

export const windowsplitterDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'windowsplitter',
  rootRole: 'separator',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: {
    separator: {
      role: 'separator',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-labelledby', from: 'items.labelledBy' },
        { attribute: 'aria-controls', from: 'relations.controlsByKey' },
        { attribute: 'aria-valuemin', from: 'options.min' },
        { attribute: 'aria-valuemax', from: 'options.max' },
        { attribute: 'aria-valuenow', from: 'state.valueByKey' },
        { attribute: 'aria-orientation', from: 'options.orientation' },
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
    { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', ...change('increment') }] },
    { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', ...change('decrement') }] },
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', ...change('increment') }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', ...change('decrement') }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', ...change('min') }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', ...change('max') }] },
    { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'always', ...collapse }] },
  ],
})
