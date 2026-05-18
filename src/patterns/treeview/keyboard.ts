import type { KeyboardBinding } from '../../schema'

const activeHasChildren = { kind: 'hasChildren', key: '$activeKey' } as const
const activeIsExpanded = { kind: 'isExpanded', key: '$activeKey' } as const
const activeClickSelect = { kind: 'optionEquals', option: 'itemClickAction', value: 'select' } as const
const activeClickToggleExpand = { kind: 'optionEquals', option: 'itemClickAction', value: 'toggleExpand' } as const

export const treeviewKeyboard = [
  { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'next' }] }] },
  { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'when', when: { kind: 'hasActiveKey' }, events: [{ type: 'navigate', direction: 'previous' }] }] },
  { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'first' }] }] },
  { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'last' }] }] },
  {
    shortcut: 'ArrowRight',
    preventDefault: true,
    cases: [
      {
        case: 'when',
        when: { kind: 'all', predicates: [activeHasChildren, { kind: 'not', predicate: activeIsExpanded }] },
        events: [{ type: 'expand', key: '$activeKey', expanded: true }],
      },
      {
        case: 'when',
        when: { kind: 'all', predicates: [activeHasChildren, activeIsExpanded] },
        events: [{ type: 'navigate', direction: 'child' }],
      },
      { case: 'otherwise', events: [{ type: 'navigate', direction: 'next' }] },
    ],
  },
  {
    shortcut: 'ArrowLeft',
    preventDefault: true,
    cases: [
      {
        case: 'when',
        when: { kind: 'all', predicates: [activeHasChildren, activeIsExpanded] },
        events: [{ type: 'expand', key: '$activeKey', expanded: false }],
      },
      { case: 'otherwise', events: [{ type: 'navigate', direction: 'parent' }] },
    ],
  },
  {
    shortcut: 'Enter',
    preventDefault: true,
    cases: [
      { case: 'when', when: { kind: 'all', predicates: [{ kind: 'hasActiveKey' }, activeClickSelect] }, events: [{ type: 'select', key: '$activeKey' }] },
      {
        case: 'when',
        when: { kind: 'all', predicates: [{ kind: 'hasActiveKey' }, activeHasChildren, activeClickToggleExpand] },
        events: [{ type: 'expand', key: '$activeKey' }],
      },
      { case: 'otherwise', events: [] },
    ],
  },
  {
    shortcut: 'Space',
    preventDefault: true,
    cases: [
      { case: 'when', when: { kind: 'all', predicates: [{ kind: 'hasActiveKey' }, activeClickSelect] }, events: [{ type: 'select', key: '$activeKey' }] },
      {
        case: 'when',
        when: { kind: 'all', predicates: [{ kind: 'hasActiveKey' }, activeHasChildren, activeClickToggleExpand] },
        events: [{ type: 'expand', key: '$activeKey' }],
      },
      { case: 'otherwise', events: [] },
    ],
  },
] satisfies readonly KeyboardBinding[]
