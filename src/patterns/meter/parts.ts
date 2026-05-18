export const meterParts = {
  meter: {
    role: 'meter',
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
  },
} as const
