import { useState } from 'react'
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
    const [variant, setVariant] = useState<MeterVariantKey>('disk')
    const variantDef = meterVariants[variant]
    const data = variantDef.data
    return {
      key: 'meter',
      label: 'Meter',
      keyboardShortcuts: [],
      sourceNames: ['Meter.tsx', 'meterData.ts', 'meter/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(data),
      variants: <VariantListbox value={variant} items={meterVariantItems} label="meter variants" idPrefix="meter-variant" onChange={setVariant} />,
      preview: <Meter data={data} options={variantDef.options ?? { min: 0, max: 100 }} onEvent={onEvent} />,
      reset: () => setVariant('disk'),
    }
  },
}
