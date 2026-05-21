import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { carouselParts } from './parts'
import { carouselTransitions } from './transitions'

export const carouselDefinition: PatternDefinition = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'carousel') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "carousel"' })
  if (value.rootRole !== 'region') ctx.addIssue({ code: 'custom', path: ['rootRole'], message: 'expected "region"' })
  if (!value.parts.root) ctx.addIssue({ code: 'custom', path: ['parts', 'root'], message: 'carousel requires parts.root' })
  if (!value.parts.slide) ctx.addIssue({ code: 'custom', path: ['parts', 'slide'], message: 'carousel requires parts.slide' })
  if (!value.parts.prev) ctx.addIssue({ code: 'custom', path: ['parts', 'prev'], message: 'carousel requires parts.prev' })
  if (!value.parts.next) ctx.addIssue({ code: 'custom', path: ['parts', 'next'], message: 'carousel requires parts.next' })
}).parse({
  apgPattern: 'carousel',
  rootRole: 'region',
  containedRoles: ['group', 'button'],
  focusModel: 'rovingTabIndex',
  parts: carouselParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      previous: { kind: 'linearWrap', action: 'previous' },
      next: { kind: 'linearWrap', action: 'next' },
    },
  },
  keyboard: [],
  transitions: carouselTransitions,
})
