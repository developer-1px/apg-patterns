import { PatternDefinitionSchema } from '../../schema'

// Meter is a read-only graphical display of a value within a known range.
// W3C APG: https://www.w3.org/WAI/ARIA/apg/patterns/meter/
//
// No keyboard interaction — it's a display, not a control.

export const meterDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'meter',
  rootRole: 'meter',
  containedRoles: [],
  parts: {
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
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [],
})
