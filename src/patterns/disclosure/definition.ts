import { PatternDefinitionSchema } from '../../schema'
import { disclosureKeyboard } from './keyboard'
import { disclosureParts } from './parts'

export const DisclosureDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'disclosure') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "disclosure"' })
  if (value.rootRole !== 'button') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "button"' })
  if (!value.parts.trigger) ctx.addIssue({ code: 'custom', path: ['parts', 'trigger'], message: 'disclosure requires parts.trigger' })
  if (!value.parts.panel) ctx.addIssue({ code: 'custom', path: ['parts', 'panel'], message: 'disclosure requires parts.panel' })
})

export const disclosureDefinition = DisclosureDefinitionSchema.parse({
  apgPattern: 'disclosure',
  rootRole: 'button',
  containedRoles: ['region'],
  focusModel: 'rovingTabIndex',
  parts: disclosureParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: disclosureKeyboard,
})
