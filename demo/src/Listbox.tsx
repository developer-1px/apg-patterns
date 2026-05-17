import { useLayoutEffect, useMemo } from 'react'
import type { HTMLAttributes } from 'react'
import { createPatternRuntime, listboxDefinition, type PatternData, type PatternEvent, type PatternOptions } from '../../src'

type Props = HTMLAttributes<HTMLElement>

export function Listbox({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const runtime = useMemo(
    () =>
      createPatternRuntime({
        definition: listboxDefinition,
        data,
        options: { focusStrategy: 'rovingTabIndex', selectionMode: 'single', ...options },
        onEvent,
        keyToElementId: (key) => `option-${key}`,
      }),
    [data, onEvent, options],
  )

  useLayoutEffect(() => {
    const activeKey = data.state?.activeKey
    if (!activeKey) return
    document.getElementById(`option-${CSS.escape(activeKey)}`)?.focus({ preventScroll: true })
  }, [data.state?.activeKey])

  const rootProps = runtime.getPartProps('listbox') as Props

  return (
    <div
      {...rootProps}
      className="grid max-w-sm gap-0.5 bg-white py-1 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-950 dark:focus:outline-zinc-500"
    >
      {(data.relations?.rootKeys ?? []).map((key) => {
        const optionProps = runtime.getPartProps('option', key) as Props
        const state = runtime.getItemState(key, 'option')
        return (
          <div
            key={key}
            {...optionProps}
            data-active={state.active ? '' : undefined}
            className="min-h-8 rounded px-2 py-1.5 text-sm text-zinc-800 outline-none aria-disabled:text-zinc-400 aria-selected:bg-zinc-100 aria-selected:text-zinc-950 data-active:bg-zinc-50 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-300 dark:aria-disabled:text-zinc-600 dark:aria-selected:bg-zinc-900 dark:aria-selected:text-zinc-50 dark:data-active:bg-zinc-900 dark:focus:outline-zinc-500"
          >
            {data.items[key]?.label}
          </div>
        )
      })}
    </div>
  )
}
