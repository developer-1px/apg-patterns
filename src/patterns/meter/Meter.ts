import type { ReactNode } from 'react'
import { renderItemCollection } from '../../adapters/reactPresetElements'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useMeterPattern, type ReactMeterRenderItem } from './useMeterPattern'

export interface MeterProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent?: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderMeter?: (item: ReactMeterRenderItem, dataItem: TItem) => ReactNode
}

export function Meter<TItem extends PatternItem = PatternItem>({ data, onEvent = () => undefined, options, className, renderMeter }: MeterProps<TItem>) {
  const meter = useMeterPattern(data, onEvent, options)

  return renderItemCollection({
    rootProps: meter.rootProps, className, items: meter.renderItems, dataItems: data.items,
    getItemProps: (item) => item.meterProps,
    children: (item, dataItem) => renderMeter?.(item, dataItem) ?? `${item.label} ${Math.round(item.percent)}%`,
  })
}
