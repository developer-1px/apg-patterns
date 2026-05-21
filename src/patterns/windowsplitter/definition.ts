import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { windowSplitterKeyboard } from './keyboard'
import { windowSplitterParts } from './parts'

// Reuses kernel/slider aria sources:
//   options.min / options.max / options.orientation
//   state.valueByKey
//   items.label / items.labelledBy
//   relations.controlsByKey

export const windowSplitterDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'windowsplitter',
  rootRole: 'separator',
  containedRoles: [],
  focusModel: 'rovingTabIndex',
  parts: windowSplitterParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: windowSplitterKeyboard,
})
