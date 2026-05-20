import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { windowsplitterKeyboard } from './keyboard'
import { windowsplitterParts } from './parts'

// Reuses kernel/slider aria sources:
//   options.min / options.max / options.orientation
//   state.valueByKey
//   items.label / items.labelledBy
//   relations.controlsByKey

export const windowsplitterDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'windowsplitter',
  rootRole: 'separator',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: windowsplitterParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: windowsplitterKeyboard,
})
