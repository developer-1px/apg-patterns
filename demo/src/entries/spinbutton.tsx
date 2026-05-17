import { useVariantPatternDataHost } from '../demoHostState'
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
    const host = useVariantPatternDataHost<SpinbuttonVariantKey>(
      'numeric',
      spinbuttonVariants.numeric.data,
      (variant) => spinbuttonVariants[variant].data,
      (variant, data, event) => reduceSpinbuttonData(data, event, spinbuttonVariants[variant].options),
    )
    const options = spinbuttonVariants[host.variant].options
    return {
      key: 'spinbutton',
      label: 'Spinbutton',
      keyboardShortcuts: ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'],
      sourceNames: ['Spinbutton.tsx', 'spinbuttonData.ts', 'spinbutton/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(host.data),
      variants: <VariantListbox value={host.variant} items={items} label="spinbutton variants" idPrefix="spinbutton-variant" onChange={host.selectVariant} />,
      preview: <Spinbutton data={host.data} options={options} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}
