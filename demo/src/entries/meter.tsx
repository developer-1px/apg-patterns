import { useVariantPatternDataHost } from '../demoHostState'
import { Meter } from '../Meter'
import { meterVariantItems, meterVariants, type MeterVariantKey } from '../meterData'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'meter',
  label: 'Meter',
  order: 20,
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<MeterVariantKey>(
      'disk',
      meterVariants.disk.data,
      (variant) => meterVariants[variant].data,
      (_variant, data) => data,
    )
    const variantDef = meterVariants[host.variant]
    return {
      key: 'meter',
      label: 'Meter',
      keyboardShortcuts: [],
      sourceNames: ['Meter.tsx', 'meterData.ts', 'meter/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(host.data),
      variants: <VariantListbox value={host.variant} items={meterVariantItems} label="meter variants" idPrefix="meter-variant" onChange={host.selectVariant} />,
      preview: <Meter data={host.data} options={variantDef.options ?? { min: 0, max: 100 }} onEvent={onEvent} />,
      reset: () => host.selectVariant('disk'),
    }
  },
}
