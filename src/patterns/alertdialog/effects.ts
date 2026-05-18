export const alertDialogEffects = [
  {
    kind: 'focus',
    when: { kind: 'isExpanded', key: '$triggerKey' },
    target: { kind: 'key', key: '$initialFocusKey' },
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
