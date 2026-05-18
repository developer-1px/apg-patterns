import { PatternDefinitionSchema } from '../../schema'
import { sliderKeyboard } from './keyboard'
import { sliderParts } from './parts'

export const sliderDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'slider',
  rootRole: 'slider',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: sliderParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: sliderKeyboard,
})
