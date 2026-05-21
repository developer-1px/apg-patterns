import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { registerMenuAriaSources } from './menuAriaSources'
import { menuButtonDefinitionKeyboard } from './menuButtonDefinitionKeyboard'
import { menuButtonParts } from './menuButtonParts'

registerMenuAriaSources()

export const menuButtonDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'menu-button',
  rootRole: 'button',
  containedRoles: ['menu', 'menuitem', 'menuitemcheckbox', 'menuitemradio'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard', 'typeahead', 'open'] }, scope: { kind: 'always' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: menuButtonParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: menuButtonDefinitionKeyboard,
})
