import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { getAlertDialogRuntimeKeys } from './alertDialogRuntimeKeys'
import { useAlertDialogPattern } from './useAlertDialogPattern'

type AlertDialogDataItem = PatternItem & {
  content?: string
}

type DivProps = ComponentPropsWithoutRef<'div'>

export interface AlertDialogProps<TItem extends AlertDialogDataItem = AlertDialogDataItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderTitle?: (item: TItem | undefined) => ReactNode
  renderDescription?: (item: TItem | undefined) => ReactNode
  renderConfirm?: (item: TItem | undefined) => ReactNode
  renderCancel?: (item: TItem | undefined) => ReactNode
}

export function AlertDialog<TItem extends AlertDialogDataItem = AlertDialogDataItem>({
  data,
  onEvent,
  options,
  className,
  renderTitle,
  renderDescription,
  renderConfirm,
  renderCancel,
}: AlertDialogProps<TItem>) {
  const alertDialog = useAlertDialogPattern(data, onEvent, options)
  const keys = getAlertDialogRuntimeKeys(data)
  const titleItem = keys.titleKey ? data.items[keys.titleKey] : undefined
  const descriptionItem = keys.descriptionKey ? data.items[keys.descriptionKey] : undefined

  return createElement('div', { className } as DivProps, [
    createElement(
      'button',
      { key: 'trigger', ...alertDialog.triggerProps } as ComponentPropsWithoutRef<'button'>,
      keys.triggerKey ? data.items[keys.triggerKey]?.label ?? alertDialog.labelOf(keys.triggerKey) : data.items.trigger?.label ?? alertDialog.labelOf('trigger'),
    ),
    alertDialog.open
      ? createElement('div', { key: 'overlay', ...alertDialog.overlayProps } as DivProps, [
          createElement('div', { key: 'dialog', ...alertDialog.dialogProps } as DivProps, [
            createElement('h2', { key: 'title', ...alertDialog.titleProps } as ComponentPropsWithoutRef<'h2'>, renderTitle?.(titleItem) ?? titleItem?.label),
            createElement(
              'p',
              { key: 'description', ...alertDialog.descriptionProps } as ComponentPropsWithoutRef<'p'>,
              renderDescription?.(descriptionItem) ?? descriptionItem?.content ?? descriptionItem?.label,
            ),
            createElement('button', { key: 'confirm', ...alertDialog.confirmProps } as ComponentPropsWithoutRef<'button'>, renderConfirm?.(data.items.confirm) ?? data.items.confirm?.label ?? 'Confirm'),
            createElement('button', { key: 'cancel', ...alertDialog.cancelProps } as ComponentPropsWithoutRef<'button'>, renderCancel?.(data.items.cancel) ?? data.items.cancel?.label ?? 'Cancel'),
          ]),
        ])
      : null,
  ])
}
