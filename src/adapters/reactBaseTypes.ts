import type { HTMLAttributes } from 'react'

export type ReactPatternProps = HTMLAttributes<HTMLElement>

export interface ReactRenderItemState {
  active: boolean
  selected: boolean
  disabled: boolean
}
