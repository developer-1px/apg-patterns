import { useRef } from 'react'
import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, usePatternAutoFocus, type PatternData, type PatternEvent } from '../../../../src'
import { toolbarDefinition } from '../../../../src/patterns/toolbar/definition'

type Props = HTMLAttributes<HTMLElement>

export function Toolbar({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const runtime = createPatternRuntime({
    definition: toolbarDefinition,
    data,
    options: { focusStrategy: 'rovingTabIndex', orientation: 'horizontal' },
    onEvent,
    keyToElementId: (key) => `toolbar-item-${key}`,
  })
  const rootProps = runtime.getPartProps('toolbar') as Props
  const onKeyDown = runtime.getRootKeyboardHandler()
  const activeKey = data.state?.activeKey
  const previousActive = useRef<string | null | undefined>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  usePatternAutoFocus(runtime, { skipInitialFocus: !previousActive.current, getScopeElement: () => rootRef.current })
  previousActive.current = activeKey

  return (
    <div
      ref={rootRef}
      {...rootProps}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })}
      className="inline-flex gap-1 rounded border border-zinc-300 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-900"
    >
      {(data.relations?.rootKeys ?? []).map((key) => {
        const itemProps = runtime.getPartProps('item', key) as Props
        return (
          <button
            type="button"
            {...itemProps}
            key={key}
            className="inline-flex h-8 items-center rounded px-2 text-sm text-zinc-800 outline-none hover:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500"
          >
            {data.items[key]?.label}
          </button>
        )
      })}
    </div>
  )
}
