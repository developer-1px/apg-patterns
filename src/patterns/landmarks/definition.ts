import type { ZodType } from 'zod'
import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { landmarksParts } from './parts'

export const LandmarksDefinitionSchema: ZodType<PatternDefinition> = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'landmarks') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "landmarks"' })
})

export const landmarksDefinition: PatternDefinition = LandmarksDefinitionSchema.parse({
  apgPattern: 'landmarks',
  rootRole: 'document',
  containedRoles: [
    'banner',
    'complementary',
    'contentinfo',
    'form',
    'main',
    'navigation',
    'region',
    'search',
  ],
  parts: landmarksParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [],
})
