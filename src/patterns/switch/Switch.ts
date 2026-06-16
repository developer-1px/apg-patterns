import type { ReactNode } from 'react'
import { renderItemCollection } from '../../adapters/reactPresetElements'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useSwitchPattern, type ReactSwitchRenderItem } from './useSwitchPattern'

export interface SwitchProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderSwitch?: (item: ReactSwitchRenderItem, dataItem: TItem) => ReactNode
}

export function Switch<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderSwitch }: SwitchProps<TItem>) {
  const switchRuntime = useSwitchPattern(data, onEvent, options)

  return renderItemCollection({
    rootProps: switchRuntime.rootProps, className, items: switchRuntime.renderItems, dataItems: data.items,
    getItemProps: (item) => item.switchProps,
    children: (item, dataItem) => renderSwitch?.(item, dataItem) ?? item.label,
  })
}
