import { valueStep } from '../valueStepKeyboard'

export const spinbuttonKeyboard = [
  { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', ...valueStep('increment') }] },
  { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', ...valueStep('decrement') }] },
  { shortcut: 'PageUp', preventDefault: true, cases: [{ case: 'always', ...valueStep('incrementLarge') }] },
  { shortcut: 'PageDown', preventDefault: true, cases: [{ case: 'always', ...valueStep('decrementLarge') }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', ...valueStep('min') }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', ...valueStep('max') }] },
] as const
