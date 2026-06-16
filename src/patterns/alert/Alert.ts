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
  const dismissButton = dismissible && data.items.dismiss
    ? createElement('button', alert.dismissProps, renderDismiss?.() ?? data.items.dismiss.label ?? 'Dismiss')
    : null

  return createElement(
    'div',
    { ...alert.rootProps, className } as ComponentPropsWithoutRef<'div'>,
    createElement('span', null, renderMessage?.(alert.message, item) ?? alert.message),
    dismissButton,
  )
}
