export const dialogEffects = [
  {
    kind: 'focus',
    when: { kind: 'isExpanded', key: '$triggerKey' },
    target: { kind: 'firstFocusable', root: { kind: 'controlledBy', key: '$triggerKey' } },
    preventScroll: true,
  },
  {
    kind: 'restoreFocus',
    when: { kind: 'not', predicate: { kind: 'isExpanded', key: '$triggerKey' } },
    target: { kind: 'key', key: '$triggerKey' },
    preventScroll: true,
  },
  {
    kind: 'trapFocus',
    when: { kind: 'isExpanded', key: '$triggerKey' },
    root: { kind: 'controlledBy', key: '$triggerKey' },
  },
] as const
