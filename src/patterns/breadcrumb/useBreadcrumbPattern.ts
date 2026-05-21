import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { createBreadcrumbItems, type ReactBreadcrumbItem } from './breadcrumbItem'
import { breadcrumbDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

interface BreadcrumbItem extends PatternItem {
  href?: unknown
}

type BreadcrumbData = PatternData<BreadcrumbItem>

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
    ...(options ?? {}),
  } satisfies PatternOptions
  const keyToElementId = usePatternElementId(runtimeOptions, 'breadcrumb-')
  const runtime = createPatternRuntime({
    definition: breadcrumbDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })

  return {
    get rootProps() {
      return reactProps(runtime.getPartProps('root'))
    },
    get listProps() {
      return reactProps(runtime.getPartProps('list'))
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
