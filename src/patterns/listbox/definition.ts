import { PatternDefinitionSchema } from '../../schema'
import { listboxEffects } from './effects'
import { listboxKeyboard } from './keyboard'
import { listboxParts } from './parts'
import { listboxReact } from './react'

export const listboxDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'listbox',
  rootRole: 'listbox',
  containedRoles: ['option'],
  focusModel: 'rovingTabIndex',
  effects: listboxEffects,
  parts: listboxParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: listboxKeyboard,
  react: listboxReact,
})
