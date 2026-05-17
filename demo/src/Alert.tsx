import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createPatternRuntime, type PatternData, type PatternEvent } from '../../src'
import { alertDefinition } from '../../src/patterns/alert/definition'
import type { AlertDomainEvent } from './alertData'

type Props = HTMLAttributes<HTMLElement>

const triggerClass =
  'inline-flex h-8 items-center rounded bg-zinc-100 px-3 text-sm text-zinc-800 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500'
const dismissClass =
  'inline-flex h-6 items-center rounded px-2 text-xs text-zinc-600 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-800'
const alertClass =
  'flex items-center justify-between gap-3 rounded bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100'

export interface AlertProps {
  data: PatternData
  onEvent: (event: AlertDomainEvent) => void
}

export function Alert({ data, onEvent }: AlertProps) {
  const runtime = createPatternRuntime({
    definition: alertDefinition,
    data,
    options: {},
    onEvent: onEvent as (event: PatternEvent) => void,
    keyToElementId: (key) => `alert-${String(key).toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`,
  })

  const alertKey = data.relations?.rootKeys?.[0] ?? 'alert'
  const visible = (data.state?.expandedKeys ?? []).includes(alertKey)
  const message = String((data.items[alertKey] as { message?: unknown } | undefined)?.message ?? '')

  const onKeyDown = runtime.getRootKeyboardHandler()

  const alertProps = runtime.getPartProps('alert', alertKey) as Props
  const dismissProps = runtime.getItemProps('dismiss', 'dismiss') as Props

  const nextMessage = `Alert at ${new Date().toLocaleTimeString()}`

  return (
    <div className="grid max-w-md gap-2">
      <button
        type="button"
        className={triggerClass}
        onClick={() => onEvent({ type: 'spawn', key: alertKey, message: nextMessage })}
      >
        Trigger alert
      </button>
      {visible ? (
        <div
          {...alertProps}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) =>
            onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })
          }
          tabIndex={-1}
          className={alertClass}
        >
          <span>{message}</span>
          <button type="button" {...dismissProps} className={dismissClass}>
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  )
}
