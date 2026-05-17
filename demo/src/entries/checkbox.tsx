import { useState } from 'react'
import { Checkbox } from '../Checkbox'
import { checkboxVariantItems, checkboxVariants, type CheckboxVariantKey } from '../checkboxData'
import { renderCheckboxInspect } from '../inspect'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'

export const entry: PatternEntry = {
  key: 'checkbox',
  label: 'Checkbox',
  order: 7,
  useDemoPattern: (onEvent) => {
    const [variant, setVariant] = useState<CheckboxVariantKey>('twoState')
    const [data, setData] = useState(checkboxVariants.twoState.data)
    return {
      key: 'checkbox',
      label: 'Checkbox',
      keyboardShortcuts: ['Space'],
      sourceNames: ['Checkbox.tsx', 'checkboxData.ts', 'checkbox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderCheckboxInspect(data),
      variants: <VariantListbox value={variant} items={checkboxVariantItems} label="checkbox variants" idPrefix="checkbox-variant" onChange={(next) => {
        setVariant(next)
        setData(checkboxVariants[next].data)
      }} />,
      preview: <Checkbox data={data} groupLabel={checkboxVariants[variant].groupLabel} onEvent={(event) => {
        onEvent(event)
        setData((current) => checkboxVariants[variant].reduce(current, event))
      }} />,
      reset: () => setData(checkboxVariants[variant].data),
    }
  },
}
