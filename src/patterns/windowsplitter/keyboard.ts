import { valueStep } from '../valueStepKeyboard'

const collapse = {
  events: [{ type: 'collapse', key: '$activeKey' }],
}

export const windowSplitterKeyboard = [
  { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', ...valueStep('increment') }] },
  { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', ...valueStep('decrement') }] },
  { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', ...valueStep('increment') }] },
  { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', ...valueStep('decrement') }] },
  { shortcut: 'PageUp', preventDefault: true, cases: [{ case: 'always', ...valueStep('incrementLarge') }] },
  { shortcut: 'PageDown', preventDefault: true, cases: [{ case: 'always', ...valueStep('decrementLarge') }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', ...valueStep('min') }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', ...valueStep('max') }] },
  { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'always', ...collapse }] },
] as const
