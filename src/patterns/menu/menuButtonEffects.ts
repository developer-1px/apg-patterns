export const menuButtonEffects = [
  { kind: 'focus', on: { state: 'activeKey', reasons: ['keyboard', 'typeahead', 'open'] }, scope: { kind: 'always' }, target: { kind: 'activeKeyElement' }, preventScroll: true },
] as const
