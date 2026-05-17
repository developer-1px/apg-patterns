import { useAlertPattern, type PatternData, type PatternEvent } from '../../../../src'
import type { AlertDomainEvent } from './alertData'

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
  const alert = useAlertPattern(data, onEvent as (event: PatternEvent) => void)
  const alertKey = alert.key ?? 'alert'

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
      {alert.state.visible ? (
        <div
          {...alert.rootProps}
          className={alertClass}
        >
          <span>{alert.message}</span>
          <button type="button" {...alert.dismissProps} className={dismissClass}>
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  )
}
