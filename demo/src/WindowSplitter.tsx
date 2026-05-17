import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, type Key, type PatternData, type PatternEvent, type PatternOptions } from '../../src'
import { windowsplitterDefinition } from '../../src/patterns/windowsplitter/definition'

type Props = HTMLAttributes<HTMLElement>
const keyToElementId = (key: Key) => `windowsplitter-${key}`

export function WindowSplitter({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const options = ((data.state as { options?: PatternOptions } | undefined)?.options ?? {}) as PatternOptions
  const runtime = createPatternRuntime({
    definition: windowsplitterDefinition,
    data,
    options,
    onEvent,
    keyToElementId,
  })
  const rootKeys = data.relations?.rootKeys ?? []
  if (rootKeys.length === 0) return null
  const key = rootKeys[0] as Key
  const controlled = data.relations?.controlsByKey?.[key]?.[0] ?? 'primary'

  const min = Number(options.min ?? 0)
  const max = Number(options.max ?? 100)
  const value = Number(data.state?.valueByKey?.[key] ?? min)
  const position = max === min ? 0 : ((value - min) / (max - min)) * 100

  const { onKeyDown: _drop, ...props } = runtime.getPartProps('separator', key) as Props

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onEvent({ type: 'focus', key })
    const result = runtime.resolveKeyboardBinding(event as unknown as KeyInput, key)
    if (!result) return
    if (result.preventDefault) event.preventDefault()
    for (const ev of result.events) onEvent(ev)
  }

  return (
    <div className="flex h-32 w-full overflow-hidden rounded border border-zinc-300 dark:border-zinc-700">
      <div
        id={keyToElementId(controlled)}
        className="bg-zinc-100 dark:bg-zinc-900"
        style={{ width: `${position}%` }}
        data-testid="windowsplitter-primary"
      />
      <div
        {...props}
        onKeyDown={handleKeyDown}
        onFocus={() => onEvent({ type: 'focus', key })}
        className="w-1 cursor-col-resize bg-zinc-400 outline-none focus:bg-zinc-700 dark:bg-zinc-600 dark:focus:bg-zinc-300"
      />
      <div className="flex-1 bg-white dark:bg-zinc-950" data-testid="windowsplitter-secondary" />
    </div>
  )
}
