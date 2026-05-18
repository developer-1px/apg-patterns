import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternDataWithOptions, PatternEvent, PatternItem, PatternOptions, PatternStateWithOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { createBreadcrumbItems, type ReactBreadcrumbItem } from './breadcrumbItem'
import { breadcrumbDefinition } from './definition'

interface BreadcrumbItem extends PatternItem {
  href?: unknown
}

type BreadcrumbData = PatternData<BreadcrumbItem, PatternStateWithOptions>

export type { ReactBreadcrumbItem } from './breadcrumbItem'

export interface ReactBreadcrumbRuntime {
  rootProps: ReactPatternProps
  listProps: ReactPatternProps
  items: readonly ReactBreadcrumbItem[]
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useBreadcrumbPattern(data: BreadcrumbData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactBreadcrumbRuntime {
  const runtimeOptions = {
    label: data.refs?.label,
    ...(options ?? data.state?.options ?? {}),
  } satisfies PatternOptions
  const runtime = createPatternRuntime({
    definition: breadcrumbDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'breadcrumb-'}${key}`,
  })

  return {
    get rootProps() {
      return runtime.getPartProps('root') as ReactPatternProps
    },
    get listProps() {
      return runtime.getPartProps('list') as ReactPatternProps
    },
    get items() {
      return createBreadcrumbItems({ runtime, data, onEvent })
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
