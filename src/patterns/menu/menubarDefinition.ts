import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { registerTreeviewNavigation } from '../treeview/navigation'
import { registerMenuAriaSources } from './menuAriaSources'
import { menubarKeyboard } from './menubarKeyboard'
import { menubarParts } from './menubarParts'

registerMenuAriaSources()
registerTreeviewNavigation()

export const menubarDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'menubar',
  rootRole: 'menubar',
  containedRoles: ['menuitem', 'menuitemcheckbox', 'menuitemradio'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard', 'typeahead'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: menubarParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
      down: { kind: 'firstChild' },
    },
  },
  keyboard: menubarKeyboard,
})
