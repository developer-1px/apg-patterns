import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { menubarDefinition } from './definition'

export interface ReactMenubarItem {
  key: Key
  label: string
  expanded: boolean
  hasChildren: boolean
  itemProps: ReactPatternProps
}

export interface ReactMenubarRuntime {
  rootProps: ReactPatternProps
  rootItems: readonly ReactMenubarItem[]
  expandedRootKeys: readonly Key[]
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useMenubarPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactMenubarRuntime {
  const runtimeOptions = { focusStrategy: 'rovingTabIndex', orientation: 'horizontal', ...(options ?? {}) } satisfies PatternOptions
  const runtime = createPatternRuntime({
    definition: menubarDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'menubar-'}${key}`,
  })
  const rootKeys = data.relations?.rootKeys ?? []
  const typeahead = useMenubarTypeahead(data, rootKeys, onEvent)
  const expandedRootKeys = rootKeys.filter((key) => data.state?.expandedKeys?.includes(key))

  usePatternEffects({ definition: menubarDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })

  return {
    get rootProps() {
      const props = runtime.getPartProps('menubar') as ReactPatternProps
      return {
        ...props,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleMenubarKey(event, props.onKeyDown as ((event: KeyboardEvent<HTMLElement>) => void) | undefined, typeahead),
      }
    },
    get rootItems() {
      return rootKeys.map((key) => {
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
      })
    },
    expandedRootKeys,
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function useMenubarTypeahead(data: PatternData, rootKeys: readonly string[], onEvent: (event: PatternEvent) => void) {
  const ref = useRef<{ query: string; timer: number | null }>({ query: '', timer: null })
  return (char: string) => {
    const state = ref.current
    state.query += char.toLowerCase()
    if (state.timer !== null) window.clearTimeout(state.timer)
    state.timer = window.setTimeout(() => {
      state.query = ''
      state.timer = null
    }, 500)
    const start = data.state?.activeKey ? rootKeys.indexOf(data.state.activeKey) : -1
    const ordered = [...rootKeys.slice(start + 1), ...rootKeys.slice(0, start + 1)]
    const match = ordered.find((key) => (data.items[key]?.label ?? '').toLowerCase().startsWith(state.query))
    if (match) onEvent({ type: 'focus', key: match, meta: { reason: 'typeahead' } })
  }
}

function handleMenubarKey(event: KeyboardEvent<HTMLElement>, baseKeyDown: ((event: KeyboardEvent<HTMLElement>) => void) | undefined, typeahead: (char: string) => void) {
  const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && /\S/.test(event.key)
  if (printable && event.key !== ' ') {
    event.preventDefault()
    typeahead(event.key)
    return
  }
  baseKeyDown?.(event)
}

function siblingKey(keys: readonly string[], key: string, direction: 'next' | 'previous') {
  if (keys.length === 0) return undefined
  const index = keys.indexOf(key)
  if (index === -1) return undefined
  return keys[(index + (direction === 'next' ? 1 : -1) + keys.length) % keys.length]
}
