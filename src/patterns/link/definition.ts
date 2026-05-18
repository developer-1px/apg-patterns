import { PatternDefinitionSchema } from '../../schema'
import { linkKeyboard } from './keyboard'
import { linkParts } from './parts'

export const LinkDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'link') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "link"' })
  if (value.rootRole !== 'link') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "link"' })
  if (!value.parts.link) ctx.addIssue({ code: 'custom', path: ['parts', 'link'], message: 'link requires parts.link' })
})

export const linkDefinition = LinkDefinitionSchema.parse({
  apgPattern: 'link',
  rootRole: 'link',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: linkParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: linkKeyboard,
})
