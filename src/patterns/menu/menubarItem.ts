import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import { withDefaultReason } from '../../kernel/domEventBindings'
import type { Key, PatternData, PatternEvent } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { getMenubarChildEntryKey, getMenubarSiblingKey } from './menubarNavigation'
import { withMenuItemRoleProps } from './menuItemRole'

export interface ReactMenubarItem {
  key: Key
  label: string
  expanded: boolean
  hasChildren: boolean
  itemProps: ReactPatternProps
}

export function createMenubarItem({
  runtime,
  data,
  key,
  rootKeys,
  onEvent,
}: {
  runtime: PatternRuntime
  data: PatternData
  key: Key
  rootKeys: readonly Key[]
  onEvent: (event: PatternEvent) => void
}): ReactMenubarItem {
  const itemProps = withMenuItemRoleProps(reactProps(runtime.getPartProps('menuitem', key)), data, key)
  const children = data.relations?.childrenByKey?.[key] ?? []
  return {
    key,
    label: data.items[key]?.label ?? key,
    expanded: data.state?.expandedKeys?.includes(key) ?? false,
    hasChildren: children.length > 0,
    itemProps: {
      ...itemProps,
      id: runtime.keyToElementId(key),
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault()
          event.stopPropagation()
          const target = getMenubarSiblingKey(rootKeys, key, event.key === 'ArrowRight' ? 'next' : 'previous', data)
          if (target) onEvent({ type: 'focus', key: target, meta: { reason: 'keyboard' } })
          return
        }
        if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && children.length > 0) {
          event.preventDefault()
          event.stopPropagation()
          onEvent(withDefaultReason({ type: 'expand', key, expanded: true }, 'keyboard'))
          const target = getMenubarChildEntryKey(children, event.key === 'ArrowDown' ? 'first' : 'last', data)
          if (target) onEvent({ type: 'focus', key: target, meta: { reason: 'keyboard' } })
          return
        }
        itemProps.onKeyDown?.(event)
      },
    },
  }
}
