import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { tooltipKeyboard } from './keyboard'
import { tooltipParts } from './parts'

export const tooltipDefinition: PatternDefinition = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'tooltip') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "tooltip"' })
  if (value.rootRole !== 'button') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "button"' })
  if (!value.parts.trigger) ctx.addIssue({ code: 'custom', path: ['parts', 'trigger'], message: 'tooltip requires parts.trigger' })
  if (!value.parts.tooltip) ctx.addIssue({ code: 'custom', path: ['parts', 'tooltip'], message: 'tooltip requires parts.tooltip' })
}).parse({
  apgPattern: 'tooltip',
  rootRole: 'button',
  containedRoles: ['tooltip'],
  focusModel: 'rovingTabIndex',
  parts: tooltipParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: tooltipKeyboard,
  transitions: [
    {
      on: 'expand',
      actions: [
        { kind: 'set', field: 'activeKey', value: { from: '$event.key' } },
        {
          kind: 'setMembership',
          field: 'expandedKeys',
          value: { from: '$event.key' },
          present: { from: '$event.expanded' },
        },
      ],
    },
  ],
})
