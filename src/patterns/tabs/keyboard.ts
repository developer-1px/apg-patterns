import type { KeyboardBinding } from '../../schema'

export const tabsKeyboard = [
  { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }] },
  { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'previous' }] }] },
  { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'when', when: { kind: 'optionEquals', option: 'orientation', value: 'vertical' }, events: [{ type: 'navigate', direction: 'next' }] }] },
  { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'when', when: { kind: 'optionEquals', option: 'orientation', value: 'vertical' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
  { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'select', key: '$activeKey' }] }] },
  { shortcut: 'Space', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'select', key: '$activeKey' }] }] },
  {
    shortcut: 'Delete',
    preventDefault: true,
    cases: [
      {
        case: 'when',
        when: { kind: 'optionEquals', option: 'closeable', value: true },
        events: [{ type: 'close', key: '$activeKey' }],
      },
    ],
  },
] satisfies readonly KeyboardBinding[]
