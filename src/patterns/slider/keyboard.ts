import { valueStep } from '../valueStepKeyboard'

export const sliderKeyboard = [
  { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', ...valueStep('increment') }] },
  { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', ...valueStep('increment') }] },
  { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', ...valueStep('decrement') }] },
  { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', ...valueStep('decrement') }] },
  { shortcut: 'Shift+ArrowRight', preventDefault: true, cases: [{ case: 'always', ...valueStep('incrementLarge') }] },
  { shortcut: 'Shift+ArrowUp', preventDefault: true, cases: [{ case: 'always', ...valueStep('incrementLarge') }] },
  { shortcut: 'Shift+ArrowLeft', preventDefault: true, cases: [{ case: 'always', ...valueStep('decrementLarge') }] },
  { shortcut: 'Shift+ArrowDown', preventDefault: true, cases: [{ case: 'always', ...valueStep('decrementLarge') }] },
  { shortcut: 'PageUp', preventDefault: true, cases: [{ case: 'always', ...valueStep('incrementLarge') }] },
  { shortcut: 'PageDown', preventDefault: true, cases: [{ case: 'always', ...valueStep('decrementLarge') }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', ...valueStep('min') }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', ...valueStep('max') }] },
] as const
