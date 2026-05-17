import { Checkbox } from './Checkbox'
import { checkboxVariantItems, checkboxVariants, type CheckboxVariantKey } from './checkboxData'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { renderDataInspect } from '../../shared/inspect/index'
import { VariantListbox } from '../../shared/VariantListbox'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'

export const entry: PatternEntry = {
  key: 'checkbox',
  label: 'Checkbox',
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
      sourceNames: ['Checkbox.tsx', 'checkboxData.ts', 'checkbox/useCheckboxPattern.ts', 'checkbox/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      variants: <VariantListbox orientation="horizontal" value={host.variant} items={checkboxVariantItems} label="checkbox variants" idPrefix="checkbox-variant" onChange={host.selectVariant} />,
      preview: <Checkbox data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
    }
  },
}
