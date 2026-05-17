import type { ReactNode } from 'react'
import type { PatternData } from '../../../../src'

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
