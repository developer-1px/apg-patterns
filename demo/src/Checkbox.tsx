import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { checkboxDefinition, createPatternRuntime, type PatternData, type PatternEvent } from '../../src'

type Props = HTMLAttributes<HTMLElement>

export function Checkbox({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const runtime = createPatternRuntime({
    definition: checkboxDefinition,
    data,
    options: {},
    onEvent,
    keyToElementId: (key) => `checkbox-${key}`,
  })
  const key = data.relations?.rootKeys?.[0]

  if (!key) return null

  const { onKeyDown: _ignore, ...props } = runtime.getPartProps('checkbox', key) as Props
  const state = runtime.getItemState(key, 'checkbox')
  const onKeyDown = runtime.getRootKeyboardHandler()

  return (
    <div
      {...props}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })}
      className="inline-flex h-8 max-w-sm items-center gap-2 rounded px-2 text-sm text-zinc-800 outline-none hover:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus:outline-zinc-500"
    >
      <span
        aria-hidden="true"
        className="grid size-4 place-items-center rounded border border-zinc-400 text-xs text-zinc-900 dark:border-zinc-600 dark:text-zinc-100"
      >
        {state.checked ? 'x' : ''}
      </span>
      <span>{data.items[key]?.label}</span>
    </div>
  )
}
