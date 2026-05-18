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
  PatternDefinitionSchema,
} from '../../index'
import { comboboxKeyboard } from './keyboard'
import { COMBOBOX_KEY, COMBOBOX_TOKEN } from './navigation'

export { COMBOBOX_KEY } from './navigation'

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
        { attribute: 'aria-haspopup', from: 'options.haspopup' },
        { attribute: 'aria-autocomplete', from: 'options.autocomplete' },
        { attribute: 'aria-activedescendant', from: AriaSources.state.activeKeyElementId },
        { attribute: 'aria-label', from: AriaSources.refs.label },
      ],
      events: [
        {
          event: DomEvents.input,
          events: [{ type: 'inputValue', key: COMBOBOX_TOKEN }],
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
  keyboard: comboboxKeyboard,
})
