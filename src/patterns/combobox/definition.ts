/**
 * APG combobox pattern — definition extracted from pattern.test.ts.
 *
 * Three APG variants are supported via the `autocomplete` PatternOption:
 *   - 'none' → Select-Only / no-autocomplete (popup contents do not filter)
 *   - 'list' → Editable with List Autocomplete (popup filters as user types)
 *   - 'both' → Editable with List + Inline Autocomplete (list filters + inline completion)
 *
 * The 'combobox' key is a synthetic root item. expandedKeys ∋ 'combobox' iff popup is open.
 *   - 'combobox' part has role 'combobox' and emits aria-expanded (explicit true/false),
 *     aria-haspopup, aria-autocomplete, aria-activedescendant, aria-label.
 *   - 'listbox' part has role 'listbox'.
 *   - 'option' part has role 'option' with aria-selected.
 */
import {
  AriaSources,
  DomEvents,
  KeyTokens,
  PatternDefinitionSchema,
  defineAriaSource,
  defineKeyToken,
  defineNavigationTarget,
  definePredicate,
  defineVisibleOrder,
} from '../../index'

export const COMBOBOX_KEY = 'combobox'
const COMBOBOX_TOKEN = '$combobox'

defineKeyToken(COMBOBOX_TOKEN, () => COMBOBOX_KEY)

defineAriaSource('combobox.popupOpen', (ctx) => ctx.data.state?.expandedKeys?.includes(COMBOBOX_KEY) ?? false)
defineAriaSource('combobox.haspopup', (ctx) => (ctx.options as Record<string, unknown>).haspopup ?? 'listbox')
defineAriaSource('combobox.autocomplete', (ctx) => (ctx.options as Record<string, unknown>).autocomplete ?? 'list')

defineVisibleOrder('comboboxOptions', (_v, data) => Object.keys(data.items).filter((k) => k !== COMBOBOX_KEY))

defineNavigationTarget('optionLinear', (target, ctx) => {
  const options = ctx.visibleKeys
  if (options.length === 0) return null
  const direction = (target as unknown as { direction: string }).direction
  const currentIdx = ctx.activeKey === COMBOBOX_KEY ? -1 : options.indexOf(ctx.activeKey)
  if (direction === 'next') return options[Math.min(currentIdx + 1, options.length - 1)] ?? options[0]
  if (direction === 'previous') return currentIdx <= 0 ? options[0] : options[currentIdx - 1]
  if (direction === 'first') return options[0]
  if (direction === 'last') return options[options.length - 1]
  return null
})

definePredicate('isPopupOpen', (_p, ctx) => ctx.data.state?.expandedKeys?.includes(COMBOBOX_KEY) ?? false)

export const comboboxDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'combobox',
  rootRole: 'combobox',
  containedRoles: ['listbox', 'option'],
  focusModel: 'ariaActiveDescendant',
  parts: {
    combobox: {
      role: 'combobox',
      aria: [
        { attribute: 'aria-expanded', from: 'combobox.popupOpen' },
        { attribute: 'aria-haspopup', from: 'combobox.haspopup' },
        { attribute: 'aria-autocomplete', from: 'combobox.autocomplete' },
        { attribute: 'aria-activedescendant', from: AriaSources.state.activeKeyElementId },
        { attribute: 'aria-label', from: AriaSources.refs.label },
      ],
      events: [
        {
          event: DomEvents.input,
          events: [{ type: 'extension', name: 'input', payload: { source: 'combobox' } }],
        },
      ],
    },
    listbox: {
      role: 'listbox',
      aria: [{ attribute: 'aria-label', from: AriaSources.items.label }],
    },
    option: {
      role: 'option',
      aria: [{ attribute: 'aria-selected', from: AriaSources.state.selectedKeys }],
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'selected', from: 'state.selectedKeys' },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'comboboxOptions' },
    targets: {
      next: { kind: 'optionLinear', direction: 'next' },
      previous: { kind: 'optionLinear', direction: 'previous' },
      first: { kind: 'optionLinear', direction: 'first' },
      last: { kind: 'optionLinear', direction: 'last' },
    },
  },
  keyboard: [
    {
      shortcut: 'ArrowDown',
      preventDefault: true,
      cases: [
        {
          case: 'when',
          when: { kind: 'not', predicate: { kind: 'extension', name: 'isPopupOpen' } },
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
          when: { kind: 'not', predicate: { kind: 'extension', name: 'isPopupOpen' } },
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
          when: { kind: 'extension', name: 'isPopupOpen' },
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
          when: { kind: 'extension', name: 'isPopupOpen' },
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
          when: { kind: 'extension', name: 'isPopupOpen' },
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
  ],
})
