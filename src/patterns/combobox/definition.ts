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
import { PatternDefinitionSchema, type PatternDefinition } from '../../schema'
import { comboboxKeyboard } from './keyboard'
import { comboboxParts } from './parts'

export { comboboxRootKey } from './navigation'

export const comboboxDefinition: PatternDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'combobox',
  rootRole: 'combobox',
  containedRoles: ['listbox', 'option'],
  focusModel: 'ariaActiveDescendant',
  parts: comboboxParts,
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
