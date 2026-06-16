import { createElement, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useWindowSplitterPattern } from './useWindowSplitterPattern'

type WindowSplitterDataItem = PatternItem & {
  content?: string
}

export interface WindowSplitterProps<TItem extends WindowSplitterDataItem = WindowSplitterDataItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderControlledPane?: (item: TItem | undefined) => ReactNode
}

export function WindowSplitter<TItem extends WindowSplitterDataItem = WindowSplitterDataItem>({
  data,
  onEvent,
  options,
  className,
  renderControlledPane,
}: WindowSplitterProps<TItem>) {
  const splitter = useWindowSplitterPattern(data, onEvent, options)
  const controlledItem = splitter.controlledKey ? data.items[splitter.controlledKey] : undefined

  return createElement('div', { ...splitter.rootProps, className },
    splitter.controlledKey
      ? createElement(
          'div',
          { id: splitter.ids.forKey(splitter.controlledKey) },
          renderControlledPane?.(controlledItem) ?? controlledItem?.content ?? controlledItem?.label,
        )
      : null,
    createElement('div', splitter.separatorProps, data.items[splitter.key ?? '']?.label ?? ''),
  )
}
