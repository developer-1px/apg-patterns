import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { checkboxKeyboard } from './keyboard'
import { checkboxParts } from './parts'

export const checkboxDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'checkbox',
  rootRole: 'checkbox',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: checkboxParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: checkboxKeyboard,
})
