import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'

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
  const itemProps = runtime.getPartProps('menuitem', key) as ReactPatternProps
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
          const target = siblingKey(rootKeys, key, event.key === 'ArrowRight' ? 'next' : 'previous')
          if (target) onEvent({ type: 'focus', key: target, meta: { reason: 'keyboard' } })
          return
        }
        if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && children.length > 0) {
          event.preventDefault()
          event.stopPropagation()
          onEvent({ type: 'expand', key, expanded: true })
          onEvent({ type: 'focus', key: event.key === 'ArrowDown' ? children[0]! : children[children.length - 1]!, meta: { reason: 'keyboard' } })
          return
        }
        itemProps.onKeyDown?.(event)
      },
    },
  }
}

function siblingKey(keys: readonly string[], key: string, direction: 'next' | 'previous') {
  if (keys.length === 0) return undefined
  const index = keys.indexOf(key)
  if (index === -1) return undefined
  return keys[(index + (direction === 'next' ? 1 : -1) + keys.length) % keys.length]
}
