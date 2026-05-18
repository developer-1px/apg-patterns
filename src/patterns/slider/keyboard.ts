const change = (direction: string) => ({
  events: [{ type: 'valueStep', key: '$activeKey', direction }],
})

export const sliderKeyboard = [
  { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', ...change('increment') }] },
  { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', ...change('increment') }] },
  { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', ...change('decrement') }] },
  { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', ...change('decrement') }] },
  { shortcut: 'Shift+ArrowRight', preventDefault: true, cases: [{ case: 'always', ...change('incrementLarge') }] },
  { shortcut: 'Shift+ArrowUp', preventDefault: true, cases: [{ case: 'always', ...change('incrementLarge') }] },
  { shortcut: 'Shift+ArrowLeft', preventDefault: true, cases: [{ case: 'always', ...change('decrementLarge') }] },
  { shortcut: 'Shift+ArrowDown', preventDefault: true, cases: [{ case: 'always', ...change('decrementLarge') }] },
  { shortcut: 'PageUp', preventDefault: true, cases: [{ case: 'always', ...change('incrementLarge') }] },
  { shortcut: 'PageDown', preventDefault: true, cases: [{ case: 'always', ...change('decrementLarge') }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', ...change('min') }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', ...change('max') }] },
] as const
