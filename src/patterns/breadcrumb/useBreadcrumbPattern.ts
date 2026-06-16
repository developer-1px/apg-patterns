import type { MouseEvent } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import { withDefaultReason } from '../../kernel/domEventBindings'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { breadcrumbDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

interface BreadcrumbItem extends PatternItem {
  href?: unknown
}

type BreadcrumbData = PatternData<BreadcrumbItem>

export interface ReactBreadcrumbItem {
  key: Key
  label: string
  current: string | boolean | null
  crumbProps: ReactPatternProps
}

export interface ReactBreadcrumbRuntime {
  rootProps: ReactPatternProps
  listProps: ReactPatternProps
  items: readonly ReactBreadcrumbItem[]
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useBreadcrumbPattern(data: PatternData<BreadcrumbItem>, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactBreadcrumbRuntime {
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

function createBreadcrumbItems({
  runtime,
  data,
  onEvent,
}: {
  runtime: PatternRuntime<BreadcrumbData>
  data: BreadcrumbData
  onEvent: (event: PatternEvent) => void
}): readonly ReactBreadcrumbItem[] {
  return (data.relations?.rootKeys ?? []).map((key) => {
    const props = reactProps(runtime.getPartProps('crumb', key))
    const current = data.state?.currentByKey?.[key] ?? null
    return {
      key,
      label: data.items[key]?.label ?? key,
      current,
      crumbProps: reactProps({
        ...props,
        href: String(data.items[key]?.href ?? '#'),
        'aria-current': current || undefined,
        onClick: (event: MouseEvent<HTMLElement>) => {
          event.preventDefault()
          onEvent(withDefaultReason({ type: 'activate', key }, 'pointer'))
        },
      }),
    }
  })
}
