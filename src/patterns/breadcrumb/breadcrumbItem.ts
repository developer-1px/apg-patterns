import type { MouseEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternStateWithOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'

interface BreadcrumbItem extends PatternItem {
  href?: unknown
}

type BreadcrumbData = PatternData<BreadcrumbItem, PatternStateWithOptions>

export interface ReactBreadcrumbItem {
  key: Key
  label: string
  current: string | boolean | null
  crumbProps: ReactPatternProps
}

export function createBreadcrumbItems({
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
          onEvent({ type: 'activate', key })
        },
      }),
    }
  })
}
