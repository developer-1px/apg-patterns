import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useDialogPattern } from './useDialogPattern'

type DialogDataItem = PatternItem & {
  content?: string
}

type DivProps = ComponentPropsWithoutRef<'div'>

export interface DialogProps<TItem extends DialogDataItem = DialogDataItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderTitle?: (item: TItem | undefined) => ReactNode
  renderDescription?: (item: TItem | undefined) => ReactNode
  renderBody?: () => ReactNode
  renderCancel?: (item: TItem | undefined) => ReactNode
  renderSubmit?: (item: TItem | undefined) => ReactNode
}

export function Dialog<TItem extends DialogDataItem = DialogDataItem>({
  data,
  onEvent,
  options,
  className,
  renderTitle,
  renderDescription,
  renderBody,
  renderCancel,
  renderSubmit,
}: DialogProps<TItem>) {
  const dialog = useDialogPattern(data, onEvent, options)
  const titleItem = data.items.title
  const descriptionItem = data.items.description

  return createElement('div', { className } as DivProps, [
    createElement('button', { key: 'trigger', ...dialog.triggerProps } as ComponentPropsWithoutRef<'button'>, data.items.trigger?.label ?? dialog.labelOf('trigger')),
    dialog.open
      ? createElement('div', { key: 'overlay', ...dialog.overlayProps } as DivProps, [
          createElement('div', { key: 'dialog', ...dialog.dialogProps } as DivProps, [
            createElement('h2', { key: 'title', ...dialog.titleProps } as ComponentPropsWithoutRef<'h2'>, renderTitle?.(titleItem) ?? titleItem?.label),
            createElement(
              'p',
              { key: 'description', ...dialog.descriptionProps } as ComponentPropsWithoutRef<'p'>,
              renderDescription?.(descriptionItem) ?? descriptionItem?.content ?? descriptionItem?.label,
            ),
            renderBody ? createElement('div', { key: 'body' } as DivProps, renderBody()) : null,
            createElement('button', { key: 'cancel', ...dialog.cancelProps } as ComponentPropsWithoutRef<'button'>, renderCancel?.(data.items.cancel) ?? data.items.cancel?.label ?? 'Cancel'),
            createElement('button', { key: 'submit', ...dialog.submitProps } as ComponentPropsWithoutRef<'button'>, renderSubmit?.(data.items.submit) ?? data.items.submit?.label ?? 'Submit'),
          ]),
        ])
      : null,
  ])
}
