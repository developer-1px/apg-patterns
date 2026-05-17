import type { HTMLAttributes, MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import type { PatternData, PatternEvent } from '../../../../src'

export type ListboxProps = HTMLAttributes<HTMLElement>

export interface ListboxGroup {
  groupKey: string
  groupLabel: string
  optionKeys: readonly string[]
}

export interface ListboxOptionRenderer {
  renderOption(key: string, posIndex?: number, setSize?: number): ReactNode
}

export interface ListboxLayoutInput extends ListboxOptionRenderer {
  data: PatternData
  groups: readonly ListboxGroup[]
  visibleKeys: readonly string[]
}

export interface ListboxSelectionContext {
  data: PatternData
  visibleKeys: readonly string[]
  selectedKeys: readonly string[]
  anchorKey: string | null
  isMulti: boolean
  onEvent: (event: PatternEvent) => void
}

export type OptionClickHandler = (event: ReactMouseEvent, key: string) => void
