import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { feedKeyboard } from './keyboard'
import { feedParts } from './parts'

// APG Feed pattern — role="feed" container with role="article" children.
// Keyboard model (per APG https://www.w3.org/WAI/ARIA/apg/patterns/feed/):
//   - PageDown : move focus to next article
//   - PageUp   : move focus to previous article
//   - Ctrl+Home: move focus to first article in feed
//   - Ctrl+End : move focus to last article in feed
export const feedDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'feed',
  rootRole: 'feed',
  containedRoles: ['article'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: feedParts,
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: feedKeyboard,
})
