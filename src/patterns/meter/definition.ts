import { defineAriaSource } from '../../patternKernel'
import { PatternDefinitionSchema } from '../../schema'

// Meter is a read-only graphical display of a value within a known range.
// W3C APG: https://www.w3.org/WAI/ARIA/apg/patterns/meter/
//
// No keyboard interaction — it's a display, not a control.
defineAriaSource('meter.options.min', (ctx) => ctx.options?.min)
defineAriaSource('meter.options.max', (ctx) => ctx.options?.max)
defineAriaSource('meter.items.valuemin', (ctx) => (ctx.key ? (ctx.data.items[ctx.key] as { valuemin?: number } | undefined)?.valuemin : undefined))
defineAriaSource('meter.items.valuemax', (ctx) => (ctx.key ? (ctx.data.items[ctx.key] as { valuemax?: number } | undefined)?.valuemax : undefined))
defineAriaSource('meter.items.valuetext', (ctx) => (ctx.key ? (ctx.data.items[ctx.key] as { valuetext?: string } | undefined)?.valuetext : undefined))

export const meterDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'meter',
  rootRole: 'meter',
  containedRoles: [],
  parts: {
    meter: {
      role: 'meter',
      keySource: 'relations.rootKeys',
      aria: [
        { attribute: 'aria-label', from: 'items.label' },
        { attribute: 'aria-labelledby', from: 'items.labelledBy' },
        { attribute: 'aria-valuemin', from: 'meter.options.min' },
        { attribute: 'aria-valuemax', from: 'meter.options.max' },
        { attribute: 'aria-valuemin', from: 'meter.items.valuemin' },
        { attribute: 'aria-valuemax', from: 'meter.items.valuemax' },
        { attribute: 'aria-valuenow', from: 'state.valueByKey' },
        { attribute: 'aria-valuetext', from: 'meter.items.valuetext' },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [],
})
