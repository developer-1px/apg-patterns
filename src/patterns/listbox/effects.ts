export const listboxEffects = [
  { kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard', 'typeahead'] }, scope: { kind: 'focusWithin' }, target: { kind: 'activeKeyElement' }, preventScroll: true },
] as const
