import { PatternDefinitionSchema } from '../../schema'

export const LandmarksDefinitionSchema = PatternDefinitionSchema.superRefine((value, ctx) => {
  if (value.apgPattern !== 'landmarks') ctx.addIssue({ code: 'custom', path: ['apgPattern'], message: 'expected "landmarks"' })
})

export const landmarksDefinition = LandmarksDefinitionSchema.parse({
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
  parts: {
    root: { role: 'document' },
    banner: { role: 'banner' },
    complementary: { role: 'complementary' },
    contentinfo: { role: 'contentinfo' },
    form: {
      role: 'form',
      aria: [{ attribute: 'aria-label', from: 'items.$key.label' }],
    },
    main: { role: 'main' },
    navigation: {
      role: 'navigation',
      aria: [{ attribute: 'aria-label', from: 'items.$key.label' }],
    },
    region: {
      role: 'region',
      aria: [{ attribute: 'aria-label', from: 'items.$key.label' }],
    },
    search: {
      role: 'search',
      aria: [{ attribute: 'aria-label', from: 'items.$key.label' }],
    },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [],
})
