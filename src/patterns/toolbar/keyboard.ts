export const toolbarKeyboard = [
  { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'when', when: { kind: 'optionEquals', option: 'orientation', value: 'horizontal' }, events: [{ type: 'navigate', direction: 'next' }] }] },
  { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'when', when: { kind: 'optionEquals', option: 'orientation', value: 'horizontal' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
  { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'when', when: { kind: 'optionEquals', option: 'orientation', value: 'vertical' }, events: [{ type: 'navigate', direction: 'next' }] }] },
  { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'when', when: { kind: 'optionEquals', option: 'orientation', value: 'vertical' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
] as const
