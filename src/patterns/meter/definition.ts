import { PatternDefinitionSchema } from '../../schema'
import { meterParts } from './parts'

// Meter is a read-only graphical display of a value within a known range.
// W3C APG: https://www.w3.org/WAI/ARIA/apg/patterns/meter/
//
// No keyboard interaction — it's a display, not a control.

export const meterDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'meter',
  rootRole: 'meter',
  containedRoles: [],
  parts: meterParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [],
})
