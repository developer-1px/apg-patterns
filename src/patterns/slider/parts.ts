export const sliderParts = {
  slider: {
    role: 'slider',
    aria: [
      { attribute: 'aria-label', from: 'items.label' },
      { attribute: 'aria-labelledby', from: 'items.labelledBy' },
      { attribute: 'aria-valuemin', from: 'options.min' },
      { attribute: 'aria-valuemax', from: 'options.max' },
      { attribute: 'aria-valuemin', from: 'items.valuemin' },
      { attribute: 'aria-valuemax', from: 'items.valuemax' },
      { attribute: 'aria-valuenow', from: 'state.valueByKey' },
      { attribute: 'aria-valuetext', from: 'items.valuetext' },
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
