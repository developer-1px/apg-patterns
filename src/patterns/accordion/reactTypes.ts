import type { Key } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'

export interface ReactAccordionRenderItem {
  kind: 'section'
  key: Key
  label: string
  textValue: string
  panelKey: Key | null
  state: {
    active: boolean
    expanded: boolean
    disabled: boolean
  }
  headerProps: ReactPatternProps
  panelProps: ReactPatternProps | null
}

export interface ReactAccordionRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactAccordionRenderItem[]
  state: {
    activeKey: Key | null
    expandedKeys: readonly Key[]
    disabledKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    toggle(key: Key): void
    expand(key: Key): void
    collapse(key: Key): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}
