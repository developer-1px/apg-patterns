import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { menubarDefinition } from './definition'
import { createMenubarItem, type ReactMenubarItem } from './menubarItem'
import { createMenubarRootProps } from './menubarRootProps'
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
      const props = reactProps(runtime.getPartProps('menubar'))
      return createMenubarRootProps(props, typeahead)
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
