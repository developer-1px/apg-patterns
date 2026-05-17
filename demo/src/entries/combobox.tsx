import { useState } from 'react'
import { type PatternData } from '../../../src'
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
    const [variant, setVariant] = useState<ComboboxVariantKey>('listAutocomplete')
    const [data, setData] = useState<PatternData>(buildComboboxData())
    return {
      key: 'combobox',
      label: 'Combobox',
      keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Escape'],
      sourceNames: ['Combobox.tsx', 'comboboxData.ts', 'combobox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderComboboxInspect(data, { autocomplete: comboboxVariants[variant].autocomplete }),
      variants: <VariantListbox value={variant} items={comboboxVariantItems} label="combobox variants" idPrefix="combobox-variant" onChange={(next) => {
        setVariant(next)
        setData(buildComboboxData())
      }} />,
      preview: (
        <Combobox
          data={data}
          variant={variant}
          onEvent={(event) => {
            onEvent(event)
            setData((current) => reduceComboboxData(current, event))
          }}
          onVisibleKeysChange={(keys) => setData(() => {
            const next = buildComboboxData(keys)
            return { ...next, state: { ...next.state, expandedKeys: ['combobox'] } }
          })}
        />
      ),
      reset: () => setData(buildComboboxData()),
    }
  },
}
