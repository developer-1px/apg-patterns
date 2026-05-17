import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { Meter } from './Meter'
import { meterVariantItems, meterVariants, type MeterVariantKey } from './meterData'
import { VariantListbox } from '../../shared/VariantListbox'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'meter',
  label: 'Meter',
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<MeterVariantKey>(
      'disk',
      meterVariants.disk.data,
      (variant) => meterVariants[variant].data,
      (_variant, data) => data,
    )
    return {
      key: 'meter',
      label: 'Meter',
      keyboardShortcuts: [],
      sourceNames: ['Meter.tsx', 'useMeterPattern.ts', 'meterData.ts', 'meter/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      variants: <VariantListbox orientation="horizontal" value={host.variant} items={meterVariantItems} label="meter variants" idPrefix="meter-variant" onChange={host.selectVariant} />,
      preview: <Meter data={host.data} onEvent={onEvent} options={meterVariants[host.variant].options} />,
    }
  },
}
