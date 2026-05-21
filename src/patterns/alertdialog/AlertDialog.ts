import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useAlertDialogPattern } from './useAlertDialogPattern'

type AlertDialogDataItem = PatternItem & {
  content?: string
}

type DivProps = ComponentPropsWithoutRef<'div'>
type ButtonProps = ComponentPropsWithoutRef<'button'>
type HeadingProps = ComponentPropsWithoutRef<'h2'>
type ParagraphProps = ComponentPropsWithoutRef<'p'>

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
  const titleItem = data.items.title
  const descriptionItem = data.items.description

  return createElement('div', { className } as DivProps, [
    createElement('button', { key: 'trigger', ...alertDialog.triggerProps } as ButtonProps, data.items.trigger?.label ?? alertDialog.labelOf('trigger')),
    alertDialog.open
      ? createElement('div', { key: 'overlay', ...alertDialog.overlayProps } as DivProps, [
          createElement('div', { key: 'dialog', ...alertDialog.dialogProps } as DivProps, [
            createElement('h2', { key: 'title', id: alertDialog.ids.forKey('title') } as HeadingProps, renderTitle?.(titleItem) ?? titleItem?.label),
            createElement(
              'p',
              { key: 'description', id: alertDialog.ids.forKey('description') } as ParagraphProps,
              renderDescription?.(descriptionItem) ?? descriptionItem?.content ?? descriptionItem?.label,
            ),
            createElement('button', { key: 'confirm', ...alertDialog.confirmProps } as ButtonProps, renderConfirm?.(data.items.confirm) ?? data.items.confirm?.label ?? 'Confirm'),
            createElement('button', { key: 'cancel', ...alertDialog.cancelProps } as ButtonProps, renderCancel?.(data.items.cancel) ?? data.items.cancel?.label ?? 'Cancel'),
          ]),
        ])
      : null,
  ])
}
