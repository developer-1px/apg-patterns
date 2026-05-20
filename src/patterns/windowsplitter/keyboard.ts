const change = (direction: string) => ({
  events: [{ type: 'valueStep', key: '$activeKey', direction }],
})

const collapse = {
  events: [{ type: 'collapse', key: '$activeKey' }],
}

export const windowsplitterKeyboard = [
  { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', ...change('increment') }] },
  { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', ...change('decrement') }] },
  { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', ...change('increment') }] },
  { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', ...change('decrement') }] },
  { shortcut: 'PageUp', preventDefault: true, cases: [{ case: 'always', ...change('incrementLarge') }] },
  { shortcut: 'PageDown', preventDefault: true, cases: [{ case: 'always', ...change('decrementLarge') }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', ...change('min') }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', ...change('max') }] },
  { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'always', ...collapse }] },
] as const
