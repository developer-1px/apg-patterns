import type { PatternData, PatternEvent } from '../../src'

export interface MenuProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  flavor?: 'menubar' | 'menu-button'
  apgPattern?: 'menubar' | 'menu-button'
  focusStrategy?: 'rovingTabIndex' | 'ariaActiveDescendant'
}
