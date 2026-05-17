import { useState } from 'react'
import { Spinbutton } from '../Spinbutton'
import { reduceSpinbuttonData, spinbuttonVariants, type SpinbuttonVariantKey } from '../spinbuttonData'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

const items: readonly { key: SpinbuttonVariantKey; label: string }[] = [
  { key: 'numeric', label: 'Numeric' },
  { key: 'time', label: 'Time' },
]

export const entry: PatternEntry = {
  key: 'spinbutton',
  label: 'Spinbutton',
  order: 21,
  useDemoPattern: (onEvent) => {
    const [variant, setVariant] = useState<SpinbuttonVariantKey>('numeric')
    const [data, setData] = useState(spinbuttonVariants.numeric.data)
    const options = spinbuttonVariants[variant].options
    return {
      key: 'spinbutton',
      label: 'Spinbutton',
      keyboardShortcuts: ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'],
      sourceNames: ['Spinbutton.tsx', 'spinbuttonData.ts', 'spinbutton/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(data),
      variants: <VariantListbox value={variant} items={items} label="spinbutton variants" idPrefix="spinbutton-variant" onChange={(next) => {
        setVariant(next)
        setData(spinbuttonVariants[next].data)
      }} />,
      preview: <Spinbutton data={data} options={options} onEvent={(event) => {
        onEvent(event)
        setData((current) => reduceSpinbuttonData(current, event, options))
      }} />,
      reset: () => setData(spinbuttonVariants[variant].data),
    }
  },
}
