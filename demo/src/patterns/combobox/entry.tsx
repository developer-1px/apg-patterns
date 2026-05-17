import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { Combobox } from './Combobox'
import { buildComboboxData, comboboxVariants, reduceComboboxData, type ComboboxVariantKey } from './comboboxData'
import { renderComboboxInspect } from '../../shared/inspect/index'
import { VariantListbox } from '../../shared/VariantListbox'
import { type PatternEntry } from '../../shared/demoPatternTypes'

const comboboxVariantItems = (Object.keys(comboboxVariants) as ComboboxVariantKey[]).map((key) => ({
  key,
  label: comboboxVariants[key].label,
}))

export const entry: PatternEntry = {
  key: 'combobox',
  label: 'Combobox',
  order: 10,
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<ComboboxVariantKey>(
      'listAutocomplete',
      buildComboboxData(undefined, 'listAutocomplete'),
      (variant) => buildComboboxData(undefined, variant),
      (_variant, data, event) => reduceComboboxData(data, event),
    )
    return {
      key: 'combobox',
      label: 'Combobox',
      keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Escape'],
      sourceNames: ['Combobox.tsx', 'comboboxData.ts', 'combobox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderComboboxInspect(host.data, { autocomplete: comboboxVariants[host.variant].autocomplete }),
      variants: <VariantListbox value={host.variant} items={comboboxVariantItems} label="combobox variants" idPrefix="combobox-variant" onChange={host.selectVariant} />,
      preview: (
        <Combobox
          data={host.data}
          onEvent={(event) => {
            onEvent(event)
            host.dispatchEvent(event)
          }}
        />
      ),
      reset: host.reset,
    }
  },
}
