import { useVariantPatternDataHost } from '../demoHostState'
import { Combobox } from '../Combobox'
import { buildComboboxData, comboboxVariants, reduceComboboxData, type ComboboxVariantKey } from '../comboboxData'
import { renderComboboxInspect } from '../inspect'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'

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
      buildComboboxData(),
      () => buildComboboxData(),
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
          variant={host.variant}
          onEvent={(event) => {
            onEvent(event)
            host.dispatchEvent(event)
          }}
          onVisibleKeysChange={(keys) => {
            const next = buildComboboxData(keys)
            host.replaceData({ ...next, state: { ...next.state, expandedKeys: ['combobox'] } })
          }}
        />
      ),
      reset: host.reset,
    }
  },
}
