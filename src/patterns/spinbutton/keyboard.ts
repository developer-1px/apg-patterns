const change = (direction: string) => ({
  events: [{ type: 'valueStep', key: '$activeKey', direction }],
})

export const spinbuttonKeyboard = [
  { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', ...change('increment') }] },
  { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', ...change('decrement') }] },
  { shortcut: 'PageUp', preventDefault: true, cases: [{ case: 'always', ...change('incrementLarge') }] },
  { shortcut: 'PageDown', preventDefault: true, cases: [{ case: 'always', ...change('decrementLarge') }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', ...change('min') }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', ...change('max') }] },
] as const
