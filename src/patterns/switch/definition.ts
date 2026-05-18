import { PatternDefinitionSchema } from '../../schema'
import { switchKeyboard } from './keyboard'
import { switchParts } from './parts'

export const switchDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'switch',
  rootRole: 'switch',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: switchParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: switchKeyboard,
})
