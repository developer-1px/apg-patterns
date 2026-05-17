import { PatternDefinitionSchema } from '../../schema'

export const TooltipDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'tooltip') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "tooltip"' })
  if (value.rootRole !== 'button') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "button"' })
  if (!value.parts.trigger) ctx.addIssue({ code: 'custom', path: ['parts', 'trigger'], message: 'tooltip requires parts.trigger' })
  if (!value.parts.tooltip) ctx.addIssue({ code: 'custom', path: ['parts', 'tooltip'], message: 'tooltip requires parts.tooltip' })
})

export const tooltipDefinition = TooltipDefinitionSchema.parse({
  apgPattern: 'tooltip',
  rootRole: 'button',
  containedRoles: ['tooltip'],
  focusModel: 'rovingTabIndex',
  parts: {
    trigger: {
      role: 'button',
      keySource: 'relations.rootKeys',
      aria: [
        { attribute: 'aria-describedby', from: 'relations.controlsByKey' },
        { attribute: 'aria-label', from: 'items.label' },
      ],
      focus: {
        tabIndex: { when: { kind: 'always' }, value: 0 },
      },
      events: [
        { event: 'focus', events: [{ type: 'expand', key: '$key', expanded: true }] },
        { event: 'blur', events: [{ type: 'expand', key: '$key', expanded: false }] },
        { event: 'mouseenter', events: [{ type: 'expand', key: '$key', expanded: true }] },
        { event: 'mouseleave', events: [{ type: 'expand', key: '$key', expanded: false }] },
      ],
    },
    tooltip: {
      role: 'tooltip',
      keySource: 'items',
      aria: [
        { attribute: 'aria-labelledby', from: 'relations.ownerByKey' },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [
    {
      shortcut: 'Escape',
      preventDefault: true,
      cases: [
        { case: 'always', events: [{ type: 'expand', key: '$activeKey', expanded: false }] },
      ],
    },
  ],
})

export const serializableTooltipDefinition = JSON.parse(
  JSON.stringify(tooltipDefinition),
) as typeof tooltipDefinition
