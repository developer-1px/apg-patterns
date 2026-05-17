import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, type PatternData, type PatternEvent } from '../../src'
import { switchDefinition } from '../../src/patterns/switch/definition'

type Props = HTMLAttributes<HTMLElement>

const itemClass =
  'inline-flex h-8 max-w-sm items-center gap-2 rounded px-2 text-sm text-zinc-800 outline-none hover:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus:outline-zinc-500'

export function Switch({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const runtime = createPatternRuntime({
    definition: switchDefinition,
    data,
    options: {},
    onEvent,
    keyToElementId: (key) => `switch-${key}`,
  })

  const rootKeys = data.relations?.rootKeys ?? []
  if (rootKeys.length === 0) return null

  const onItemKeyDown = (key: string) => (event: KeyboardEvent<HTMLDivElement>) => {
    const result = runtime.resolveKeyboardBinding(event as unknown as KeyInput, key)
    if (!result) return
    if (result.preventDefault) event.preventDefault()
    for (const next of result.events) runtime.emit(next)
  }

  const onItemFocus = (key: string) => () => runtime.emit({ type: 'focus', key })

  return (
    <div className="grid gap-1">
      {rootKeys.map((key) => {
        const { onKeyDown: _ignore, ...props } = runtime.getPartProps('switch', key) as Props
        const state = runtime.getItemState(key, 'switch')
        const on = state.checked === true
        return (
          <div
            key={key}
            {...props}
            tabIndex={0}
            onKeyDown={onItemKeyDown(key)}
            onFocus={onItemFocus(key)}
            className={itemClass}
          >
            <span
              aria-hidden="true"
              className={`relative inline-block h-4 w-7 rounded-full transition ${on ? 'bg-zinc-800 dark:bg-zinc-200' : 'bg-zinc-300 dark:bg-zinc-700'}`}
            >
              <span
                className={`absolute top-0.5 inline-block h-3 w-3 rounded-full bg-white transition ${on ? 'left-3.5' : 'left-0.5'}`}
              />
            </span>
            <span>{data.items[key]?.label}</span>
          </div>
        )
      })}
    </div>
  )
}
