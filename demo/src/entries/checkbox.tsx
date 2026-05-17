import { Checkbox } from '../Checkbox'
import { checkboxVariantItems, checkboxVariants, type CheckboxVariantKey } from '../checkboxData'
import { useVariantPatternDataHost } from '../demoHostState'
import { renderCheckboxInspect } from '../inspect'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'

export const entry: PatternEntry = {
  key: 'checkbox',
  label: 'Checkbox',
  order: 7,
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<CheckboxVariantKey>(
      'twoState',
      checkboxVariants.twoState.data,
      (variant) => checkboxVariants[variant].data,
      (variant, data, event) => checkboxVariants[variant].reduce(data, event),
    )
    return {
      key: 'checkbox',
      label: 'Checkbox',
      keyboardShortcuts: ['Space'],
      sourceNames: ['Checkbox.tsx', 'checkboxData.ts', 'checkbox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderCheckboxInspect(host.data),
      variants: <VariantListbox value={host.variant} items={checkboxVariantItems} label="checkbox variants" idPrefix="checkbox-variant" onChange={host.selectVariant} />,
      preview: <Checkbox data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}
