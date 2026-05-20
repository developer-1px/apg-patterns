import { KeyTokens } from '../../kernel/kernelVocabulary'
import type { KeyboardBinding } from '../../schema'
import { COMBOBOX_TOKEN } from './navigation'

export const comboboxKeyboard = [
  {
    shortcut: 'ArrowDown',
    preventDefault: true,
    cases: [
      {
        case: 'when',
        when: { kind: 'not', predicate: { kind: 'isPopupOpen' } },
        events: [
          { type: 'expand', key: COMBOBOX_TOKEN, expanded: true },
          { type: 'navigate', direction: 'first' },
        ],
      },
      { case: 'otherwise', events: [{ type: 'navigate', direction: 'next' }] },
    ],
  },
  {
    shortcut: 'ArrowUp',
    preventDefault: true,
    cases: [
      {
        case: 'when',
        when: { kind: 'not', predicate: { kind: 'isPopupOpen' } },
        events: [
          { type: 'expand', key: COMBOBOX_TOKEN, expanded: true },
          { type: 'navigate', direction: 'last' },
        ],
      },
      { case: 'otherwise', events: [{ type: 'navigate', direction: 'previous' }] },
    ],
  },
  {
    shortcut: 'Home',
    preventDefault: false,
    cases: [
      {
        case: 'when',
        when: { kind: 'isPopupOpen' },
        events: [{ type: 'navigate', direction: 'first' }],
      },
    ],
  },
  {
    shortcut: 'End',
    preventDefault: false,
    cases: [
      {
        case: 'when',
        when: { kind: 'isPopupOpen' },
        events: [{ type: 'navigate', direction: 'last' }],
      },
    ],
  },
  {
    shortcut: 'Enter',
    preventDefault: true,
    cases: [
      {
        case: 'when',
        when: { kind: 'isPopupOpen' },
        events: [
          { type: 'select', key: KeyTokens.activeKey },
          { type: 'expand', key: COMBOBOX_TOKEN, expanded: false },
        ],
      },
    ],
  },
  {
    shortcut: 'Escape',
    preventDefault: true,
    cases: [{ case: 'always', events: [{ type: 'expand', key: COMBOBOX_TOKEN, expanded: false }] }],
  },
] satisfies readonly KeyboardBinding[]
