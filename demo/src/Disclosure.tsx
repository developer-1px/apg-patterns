import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createDisclosureRuntime, type PatternData, type PatternEvent } from '../../src'
import { disclosurePanelText } from './disclosureData'

type Props = HTMLAttributes<HTMLElement>

export function Disclosure({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const runtime = createDisclosureRuntime({ data, onEvent })
  const { onKeyDown: _ignore, ...triggerProps } = runtime.getTriggerProps() as Props
  const panelProps = runtime.getPanelProps() as Props
  const onKeyDown = runtime.getRootKeyboardHandler()

  return (
    <div className="grid max-w-md gap-2">
      <button
        type="button"
        {...triggerProps}
        onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) =>
          onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })
        }
        className="inline-flex h-8 items-center justify-between rounded bg-zinc-100 px-3 text-sm text-zinc-800 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500"
      >
        <span>{runtime.triggerKey ? data.items[runtime.triggerKey]?.label : 'Disclosure'}</span>
        <span aria-hidden="true" className="ml-3 text-xs text-zinc-500 dark:text-zinc-400">
          {runtime.expanded ? '▾' : '▸'}
        </span>
      </button>
      {runtime.expanded ? (
        <div
          {...panelProps}
          className="rounded bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300"
        >
          {disclosurePanelText}
        </div>
      ) : null}
    </div>
  )
}
