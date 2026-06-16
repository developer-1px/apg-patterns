import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useAlertPattern } from './useAlertPattern'

type AlertDataItem = PatternItem & {
  message?: unknown
}

export interface AlertProps<TItem extends AlertDataItem = AlertDataItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  dismissible?: boolean
  renderMessage?: (message: string, item: TItem | undefined) => ReactNode
  renderDismiss?: () => ReactNode
}

export function Alert<TItem extends AlertDataItem = AlertDataItem>({
  data,
  onEvent,
  options,
  className,
  dismissible = true,
  renderMessage,
  renderDismiss,
}: AlertProps<TItem>) {
  const alert = useAlertPattern(data, onEvent, options)
  if (!alert.key || !alert.state.visible) return null

  const item = data.items[alert.key]
  const children: ReactNode[] = [
    createElement('span', { key: `${alert.key}-message` }, renderMessage?.(alert.message, item) ?? alert.message),
  ]

  if (dismissible && data.items.dismiss) {
    children.push(
      createElement('button', { key: `${alert.key}-dismiss`, ...alert.dismissProps } as ComponentPropsWithoutRef<'button'>, renderDismiss?.() ?? data.items.dismiss.label ?? 'Dismiss'),
    )
  }

  return createElement('div', { ...alert.rootProps, className } as ComponentPropsWithoutRef<'div'>, children)
}
