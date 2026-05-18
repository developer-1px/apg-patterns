import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { Combobox } from './Combobox'
import { buildComboboxData, comboboxVariants, reduceComboboxData, type ComboboxVariantKey } from './comboboxData'
import { renderDataInspect } from '../../shared/inspect/index'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'
import type { PatternEvent } from '../../../../src'

const comboboxVariantItems = (Object.keys(comboboxVariants) as ComboboxVariantKey[]).map((key) => ({
  key,
  label: comboboxVariants[key].label,
}))

const comboboxDemoDefinition = {
  key: 'combobox',
  label: 'Combobox',
  keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Escape'],
  sources: {
    main: 'Combobox.tsx',
    entry: 'combobox/entry.tsx',
    hooks: ['combobox/useComboboxPattern.ts'],
    data: ['comboboxData.ts'],
    definition: 'combobox/definition.ts',
    extra: [
      'combobox/comboboxInputProps.ts',
      'combobox/comboboxOption.ts',
      'combobox/keyboard.ts',
      'combobox/navigation.ts',
      'combobox/parts.ts',
      'combobox/useComboboxActiveOptionScroll.ts',
      'combobox/useComboboxInlineCompletionInputRef.ts',
      'combobox/inspect.ts',
    ],
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'combobox variants',
    idPrefix: 'combobox-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Combobox',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: comboboxDemoDefinition,
  useRuntime: (onEvent) => {
    const host = useVariantPatternDataHost<ComboboxVariantKey>(
      'listAutocomplete',
      buildComboboxData(undefined, 'listAutocomplete'),
      (variant) => buildComboboxData(undefined, variant),
      (_variant, data, event) => reduceComboboxData(data, event),
    )
    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: { variant: host.variant, data: host.data },
          model: { variantItems: comboboxVariantItems },
        },
        actions: {
          selectVariant: host.selectVariant,
          dispatchEvent: (event: PatternEvent) => {
            onEvent(event)
            host.dispatchEvent(event)
          },
        },
        components: { Combobox },
      },
    }
  },
})
