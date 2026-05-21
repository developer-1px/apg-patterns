import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { treegridDefinition } from './definition'
import { createTreegridRows, type ReactTreegridRow } from './treegridRow'
import { usePatternElementId } from '../../adapters/reactDomIds'
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

export function useTreegridPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactTreegridRuntime {
  const runtimeOptions = {
    focusStrategy: 'rovingTabIndex',
    selectionMode: 'single',
    ...(options ?? {}),
  } satisfies PatternOptions
  const keyToElementId = usePatternElementId(runtimeOptions, 'treegridcell-')
  const runtime = createPatternRuntime({
    definition: treegridDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })

  usePatternEffects({ definition: treegridDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })

  return {
    get treegridProps() {
      return reactProps(runtime.getPartProps('treegrid'))
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
