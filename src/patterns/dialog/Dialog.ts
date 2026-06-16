import { createElement, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useDialogPattern } from './useDialogPattern'

type DialogDataItem = PatternItem & {
  content?: string
}

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

  return createElement('div', { className },
    createElement('button', dialog.triggerProps, data.items.trigger?.label ?? dialog.labelOf('trigger')),
    dialog.open
      ? createElement('div', dialog.overlayProps,
          createElement('div', dialog.dialogProps,
            createElement('h2', dialog.titleProps, renderTitle?.(titleItem) ?? titleItem?.label),
            createElement('p', dialog.descriptionProps, renderDescription?.(descriptionItem) ?? descriptionItem?.content ?? descriptionItem?.label),
            renderBody ? createElement('div', null, renderBody()) : null,
            createElement('button', dialog.cancelProps, renderCancel?.(data.items.cancel) ?? data.items.cancel?.label ?? 'Cancel'),
            createElement('button', dialog.submitProps, renderSubmit?.(data.items.submit) ?? data.items.submit?.label ?? 'Submit'),
          ),
        )
      : null,
  )
}
