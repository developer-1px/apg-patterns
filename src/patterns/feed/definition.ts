import { PatternDefinitionSchema } from '../../schema'

// APG Feed pattern — role="feed" container with role="article" children.
// Keyboard model (per APG https://www.w3.org/WAI/ARIA/apg/patterns/feed/):
//   - PageDown : move focus to next article
//   - PageUp   : move focus to previous article
//   - Ctrl+Home: move focus to first article in feed
//   - Ctrl+End : move focus to last article in feed
export const feedDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'feed',
  rootRole: 'feed',
  containedRoles: ['article'],
  focusModel: 'rovingTabIndex',
  effects: [{ kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true }],
  parts: {
    feed: {
      role: 'feed',
      keySource: 'relations.rootKeys',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
      ],
    },
    article: {
      role: 'article',
      keySource: 'collectionItemKey',
      aria: [
        { attribute: 'aria-posinset', from: 'state.posInSetByKey' },
        { attribute: 'aria-setsize', from: 'state.setSizeByKey' },
        { attribute: 'aria-labelledby', from: 'items.labelledBy' },
      ],
      focus: {
        tabIndex: { when: { kind: 'always' }, active: 0, inactive: -1 },
      },
      state: [
        { name: 'active', from: 'state.activeKey' },
      ],
      events: [
        { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
      ],
    },
  },
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
    { shortcut: 'PageDown', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'next' }] }] },
    { shortcut: 'PageUp', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
    { shortcut: 'Control+Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
    { shortcut: 'Control+End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
  ],
})
