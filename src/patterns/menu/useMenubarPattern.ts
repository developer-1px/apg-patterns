import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { menubarDefinition } from './definition'
import { createMenubarItem, type ReactMenubarItem } from './menubarItem'
import { useMenubarTypeahead } from './useMenubarTypeahead'

export type { ReactMenubarItem } from './menubarItem'

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
      return rootKeys.map((key) => createMenubarItem({ runtime, data, key, rootKeys, onEvent }))
    },
    expandedRootKeys,
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
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
