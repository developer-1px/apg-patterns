import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useMeterPattern, type ReactMeterRenderItem } from './useMeterPattern'

type DivProps = ComponentPropsWithoutRef<'div'>

export interface MeterProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent?: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderMeter?: (item: ReactMeterRenderItem, dataItem: TItem) => ReactNode
}

export function Meter<TItem extends PatternItem = PatternItem>({ data, onEvent = () => undefined, options, className, renderMeter }: MeterProps<TItem>) {
  const meter = useMeterPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...meter.rootProps, className } as DivProps,
    meter.renderItems.map((item) =>
      createElement('div', { key: item.key, ...item.meterProps } as DivProps & { key: Key }, renderMeter?.(item, data.items[item.key]) ?? `${item.label} ${Math.round(item.percent)}%`),
    ),
  )
}
