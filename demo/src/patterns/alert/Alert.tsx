import { useAlertPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import type { AlertDomainEvent } from './alertData'

const alertClass =
  'flex items-center justify-between gap-3 rounded-xl bg-amber-50/90 p-3 text-sm text-amber-950 shadow-[0_12px_32px_rgba(146,64,14,0.12)] ring-1 ring-amber-900/[0.04] dark:bg-amber-500/12 dark:text-amber-100 dark:ring-amber-100/[0.06]'

interface AlertProps {
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
        className={ds.button}
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
          <button type="button" {...alert.dismissProps} className={cx(ds.textButton, 'h-6 text-amber-900/70 hover:bg-white/55 dark:text-amber-100/75')}>
            Dismiss
          </button>
        </div>
      ) : null}
    </div>
  )
}
