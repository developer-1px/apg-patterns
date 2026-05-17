import { useAlertPattern, type PatternData, type PatternEvent } from '../../../../src'
import type { AlertDomainEvent } from './alertData'

const triggerClass =
  'inline-flex h-8 items-center rounded-xl bg-zinc-100/80 px-3 text-sm font-medium text-zinc-800 shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500'
const dismissClass =
  'inline-flex h-6 items-center rounded-lg px-2 text-xs font-medium text-amber-900/70 outline-none transition hover:bg-white/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:text-amber-100/75 dark:hover:bg-white/[0.08]'
const alertClass =
  'flex items-center justify-between gap-3 rounded-xl bg-amber-50/90 p-3 text-sm text-amber-950 shadow-[0_12px_32px_rgba(146,64,14,0.12)] ring-1 ring-amber-900/[0.04] dark:bg-amber-500/12 dark:text-amber-100 dark:ring-amber-100/[0.06]'

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
