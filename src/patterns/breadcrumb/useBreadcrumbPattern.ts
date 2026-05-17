import type { MouseEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { breadcrumbDefinition } from './definition'

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

export function useBreadcrumbPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactBreadcrumbRuntime {
  const runtimeOptions = {
    label: data.refs?.label,
    ...(options ?? ((data.state as { options?: PatternOptions } | undefined)?.options ?? {})),
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
      return (data.relations?.rootKeys ?? []).map((key) => {
        const props = runtime.getPartProps('crumb', key) as ReactPatternProps
        const current = data.state?.currentByKey?.[key] ?? null
        return {
          key,
          label: data.items[key]?.label ?? key,
          current,
          crumbProps: {
            ...props,
            href: String((data.items[key] as { href?: unknown } | undefined)?.href ?? '#'),
            'aria-current': current || undefined,
            onClick: (event: MouseEvent<HTMLElement>) => {
              event.preventDefault()
              onEvent({ type: 'activate', key })
            },
          } as ReactPatternProps,
        }
      })
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}
