import { useRef, type KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import { registerKernelBuiltins } from '../../kernel/kernelBuiltins'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { menubarDefinition } from './definition'
import { createMenubarItem, type ReactMenubarItem } from './menubarItem'
import { usePatternElementId } from '../../adapters/reactDomIds'

registerKernelBuiltins()

export type { ReactMenubarItem } from './menubarItem'

export interface ReactMenubarRuntime {
  rootProps: ReactPatternProps
  rootItems: readonly ReactMenubarItem[]
  itemsFor(parentKey: Key): readonly ReactMenubarItem[]
  expandedRootKeys: readonly Key[]
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useMenubarPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactMenubarRuntime {
  const runtimeOptions = { focusStrategy: 'rovingTabIndex', orientation: 'horizontal', ...(options ?? {}) } satisfies PatternOptions
  const keyToElementId = usePatternElementId(runtimeOptions, 'menubar-')
  const runtime = createPatternRuntime({
    definition: menubarDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })
  const rootKeys = data.relations?.rootKeys ?? []
  const typeahead = useMenubarTypeahead(data, rootKeys, onEvent)
  const expandedRootKeys = rootKeys.filter((key) => data.state?.expandedKeys?.includes(key))

  usePatternEffects({ definition: menubarDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })

  return {
    get rootProps() {
      const props = reactProps(runtime.getPartProps('menubar'))
      return createMenubarRootProps(props, typeahead)
    },
    get rootItems() {
      return rootKeys.map((key) => createMenubarItem({ runtime, data, key, rootKeys, onEvent }))
    },
    itemsFor(parentKey) {
      const itemKeys = data.relations?.childrenByKey?.[parentKey] ?? []
      return itemKeys.map((key) => createMenubarItem({ runtime, data, key, rootKeys: itemKeys, onEvent }))
    },
    expandedRootKeys,
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createMenubarRootProps(props: ReactPatternProps, typeahead: (char: string) => void): ReactPatternProps {
  return {
    ...props,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleMenubarKey(event, props.onKeyDown as ((event: KeyboardEvent<HTMLElement>) => void) | undefined, typeahead),
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
