export const windowSplitterParts = {
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
} as const
