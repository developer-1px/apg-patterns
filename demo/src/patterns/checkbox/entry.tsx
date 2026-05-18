import { Checkbox } from './Checkbox'
import { checkboxVariantItems, checkboxVariants, type CheckboxVariantKey } from './checkboxData'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { renderDataInspect } from '../../shared/inspect/index'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'
import type { PatternEvent } from '../../../../src'

const checkboxDemoDefinition = {
  key: 'checkbox',
  label: 'Checkbox',
  keyboardShortcuts: ['Space'],
  sources: {
    main: 'Checkbox.tsx',
    entry: 'checkbox/entry.tsx',
    data: ['checkboxData.ts'],
    hooks: ['checkbox/useCheckboxPattern.ts'],
    definition: 'checkbox/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'checkbox variants',
    idPrefix: 'checkbox-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Checkbox',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: checkboxDemoDefinition,
  useRuntime: (onEvent) => {
    const host = useVariantPatternDataHost<CheckboxVariantKey>(
      'twoState',
      checkboxVariants.twoState.data,
      (variant) => checkboxVariants[variant].data,
      (variant, data, event) => checkboxVariants[variant].reduce(data, event),
    )
    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: {
            variant: host.variant,
            data: host.data,
          },
          model: {
            variantItems: checkboxVariantItems,
          },
        },
        actions: {
          selectVariant: host.selectVariant,
          dispatchEvent: (event: PatternEvent) => {
            onEvent(event)
            host.dispatchEvent(event)
          },
        },
        components: {
          Checkbox,
        },
      },
    }
  },
})
