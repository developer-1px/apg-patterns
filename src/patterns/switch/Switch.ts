import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactSwitchRenderItem } from './switchRenderItem'
import { useSwitchPattern } from './useSwitchPattern'

type DivProps = ComponentPropsWithoutRef<'div'>

export interface SwitchProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderSwitch?: (item: ReactSwitchRenderItem, dataItem: TItem) => ReactNode
}

export function Switch<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderSwitch }: SwitchProps<TItem>) {
  const switchRuntime = useSwitchPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...switchRuntime.rootProps, className } as DivProps,
    switchRuntime.renderItems.map((item) =>
      createElement('div', { key: item.key, ...item.switchProps } as DivProps & { key: Key }, renderSwitch?.(item, data.items[item.key]) ?? item.label),
    ),
  )
}
