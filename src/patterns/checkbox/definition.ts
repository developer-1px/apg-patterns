import { PatternDefinitionSchema } from '../../schema'
import { checkboxKeyboard } from './keyboard'
import { checkboxParts } from './parts'

export const checkboxDefinition = PatternDefinitionSchema.parse({
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
