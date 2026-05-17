import type { KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, type Key, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { spinbuttonDefinition } from '../../../../src/patterns/spinbutton/definition'

export function Spinbutton({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const options = (((data.state as { options?: PatternOptions } | undefined)?.options ?? {}) as PatternOptions)
  const runtime = createPatternRuntime({
    definition: spinbuttonDefinition,
    data,
    options,
    onEvent,
    keyToElementId: (key) => `spinbutton-${key}`,
  })
  const rootKeys = data.relations?.rootKeys ?? []
  if (rootKeys.length === 0) return null

  const getThumbKeyDownHandler = (key: Key) => (event: KeyInput & { preventDefault?: () => void }) => {
    const result = runtime.resolveKeyboardBinding(event, key)
    if (!result) return
    if (result.preventDefault) event.preventDefault?.()
    for (const ev of result.events) onEvent(ev)
  }

  return (
    <div className="flex items-center gap-2">
      {rootKeys.map((key, idx) => (
        <SpinField
          key={key}
          fieldKey={key}
          data={data}
          runtime={runtime}
          onEvent={onEvent}
          onKeyDown={getThumbKeyDownHandler(key)}
          separator={idx < rootKeys.length - 1 && rootKeys.length > 1 ? ':' : null}
        />
      ))}
    </div>
  )
}

function SpinField({
  fieldKey,
  data,
  runtime,
  onEvent,
  onKeyDown,
  separator,
}: {
  fieldKey: Key
  data: PatternData
  runtime: ReturnType<typeof createPatternRuntime>
  onEvent: (event: PatternEvent) => void
  onKeyDown: (event: KeyInput & { preventDefault?: () => void }) => void
  separator: string | null
}) {
  const { onKeyDown: _drop, ...props } = runtime.getPartProps('spinbutton', fieldKey) as Record<string, unknown>
  const value = Number(data.state?.valueByKey?.[fieldKey] ?? 0)
  const item = data.items[fieldKey]
  const label = (item as { label?: string } | undefined)?.label

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onEvent({ type: 'focus', key: fieldKey })
    onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })
  }

  const emit = (direction: 'increment' | 'decrement') => {
    onEvent({ type: 'focus', key: fieldKey })
    onEvent({ type: 'valueStep', key: fieldKey, direction })
  }

  return (
    <div className="flex items-center gap-1">
      <div className="grid gap-1">
        <span className="text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={`Decrement ${label ?? fieldKey}`}
            onClick={() => emit('decrement')}
            className="size-6 rounded border border-zinc-300 dark:border-zinc-700"
          >
            −
          </button>
          <div
            {...(props as Record<string, unknown>)}
            onKeyDown={handleKeyDown}
            onFocus={() => onEvent({ type: 'focus', key: fieldKey })}
            data-testid={`spinbutton-${fieldKey}`}
            className="min-w-[2.5rem] rounded border border-zinc-300 px-2 py-1 text-center outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:border-zinc-700 dark:focus:outline-zinc-500"
          >
            {value}
          </div>
          <button
            type="button"
            aria-label={`Increment ${label ?? fieldKey}`}
            onClick={() => emit('increment')}
            className="size-6 rounded border border-zinc-300 dark:border-zinc-700"
          >
            +
          </button>
        </div>
      </div>
      {separator ? <span className="self-end pb-1 text-lg">{separator}</span> : null}
    </div>
  )
}
