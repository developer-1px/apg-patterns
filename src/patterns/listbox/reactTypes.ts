import type { Key } from '../../schema'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'

export interface ReactListboxRenderItem {
  kind: 'option'
  key: Key
  label: string
  textValue: string
  state: ReactRenderItemState
  optionProps: ReactPatternProps
}

export interface ReactListboxRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactListboxRenderItem[]
  state: {
    activeKey: Key | null
    selectedKeys: readonly Key[]
    disabledKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    select(key: Key): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}
