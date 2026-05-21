import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { registerMenuAriaSources } from './menuAriaSources'
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
  keyboard: [
    { shortcut: 'ArrowDown', preventDefault: true, cases: activeItemCases([{ type: 'navigate', direction: 'next' }]) },
    { shortcut: 'ArrowUp', preventDefault: true, cases: activeItemCases([{ type: 'navigate', direction: 'previous' }]) },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
    { shortcut: 'Enter', preventDefault: true, cases: activeItemCases([{ type: 'activate', key: '$activeKey' }, { type: 'dismiss' }]) },
    { shortcut: 'Space', preventDefault: true, cases: activeItemCases([{ type: 'activate', key: '$activeKey' }, { type: 'dismiss' }]) },
    { shortcut: 'Escape', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'dismiss' }] }] },
  ],
})

function activeItemCases(events: readonly unknown[]) {
  return [{ case: 'when', when: { kind: 'hasActiveKey' }, events }]
}
