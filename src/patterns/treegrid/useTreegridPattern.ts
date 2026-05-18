import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternDataWithOptions, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { treegridDefinition } from './definition'
import { createTreegridRows, type ReactTreegridRow } from './treegridRow'
export type { ReactTreegridCell, ReactTreegridRow } from './treegridRow'

export interface ReactTreegridRuntime {
  treegridProps: ReactPatternProps
  rows: readonly ReactTreegridRow[]
  columnCount: number
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useTreegridPattern(data: PatternDataWithOptions, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactTreegridRuntime {
  const runtimeOptions = {
    focusStrategy: 'rovingTabIndex',
    selectionMode: 'single',
    ...(options ?? data.state?.options ?? {}),
  } satisfies PatternOptions
  const runtime = createPatternRuntime({
    definition: treegridDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'treegridcell-'}${key}`,
  })

  usePatternEffects({ definition: treegridDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })

  return {
    get treegridProps() {
      return runtime.getPartProps('treegrid') as ReactPatternProps
    },
    get rows() {
      return createTreegridRows({ runtime, data })
    },
    columnCount: data.relations?.columnKeys?.length ?? 1,
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
