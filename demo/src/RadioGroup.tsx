import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, radioGroupDefinition, type PatternData, type PatternEvent } from '../../src'

type Props = HTMLAttributes<HTMLElement>

export function RadioGroup({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const runtime = createPatternRuntime({
    definition: radioGroupDefinition,
    data,
    options: { focusStrategy: 'rovingTabIndex' },
    onEvent,
    keyToElementId: (key) => `radio-${key}`,
  })
  const rootProps = runtime.getPartProps('radiogroup') as Props
  const onKeyDown = runtime.getRootKeyboardHandler()

  return (
    <div
      {...rootProps}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })}
      className="grid max-w-sm gap-1 outline-none"
    >
      {(data.relations?.rootKeys ?? []).map((key) => {
        const radioProps = runtime.getPartProps('radio', key) as Props
        const state = runtime.getItemState(key, 'radio')
        return (
          <div
            {...radioProps}
            key={key}
            className="inline-flex h-8 items-center gap-2 rounded px-2 text-sm text-zinc-800 outline-none hover:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus:outline-zinc-500"
          >
            <span className="grid size-4 place-items-center rounded-full border border-zinc-400 dark:border-zinc-600" aria-hidden="true">
              {state.checked ? <span className="size-2 rounded-full bg-zinc-900 dark:bg-zinc-100" /> : null}
            </span>
            <span>{data.items[key]?.label}</span>
          </div>
        )
      })}
    </div>
  )
}
