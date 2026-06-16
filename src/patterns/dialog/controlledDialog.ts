import { useLayoutEffect, useRef, type KeyboardEvent } from 'react'
import { FOCUSABLE_SELECTOR } from '../../adapters/reactElementTargets'
import type { Key, PatternData, PatternEvent, PatternEventReason } from '../../schema'

export type ReactDialogFocusTarget =
  | HTMLElement
  | null
  | { readonly current: HTMLElement | null }
  | (() => HTMLElement | null)

export interface ReactControlledDialogOpenChangeMeta {
  reason: PatternEventReason
  key?: Key
}

export interface ReactControlledDialogConfig {
  open: boolean
  onOpenChange(open: boolean, meta: ReactControlledDialogOpenChangeMeta): void
  onEvent?: (event: PatternEvent) => void
  initialFocusKey?: Key
  restoreFocusTo?: ReactDialogFocusTarget
}

export function useControlledDialogFocus({
  open,
  data,
  keyToElementId,
  dialogKey,
  initialFocusKey,
  restoreFocusTo,
}: {
  open: boolean
  data: PatternData
  keyToElementId(key: Key): string
  dialogKey?: Key | null
  initialFocusKey?: Key
  restoreFocusTo?: ReactDialogFocusTarget
}) {
  const wasOpen = useRef(false)

  useLayoutEffect(() => {
    const opened = open && !wasOpen.current
    const closed = !open && wasOpen.current
    wasOpen.current = open

    if (opened) focusInitialDialogTarget({ data, keyToElementId, dialogKey, initialFocusKey })
    if (closed) resolveDialogFocusTarget(restoreFocusTo)?.focus({ preventScroll: true })
  }, [data, dialogKey, initialFocusKey, keyToElementId, open, restoreFocusTo])
}

export function handleControlledDialogKeyDown({
  event,
  open,
  keyToElementId,
  dialogKey,
  onClose,
}: {
  event: KeyboardEvent<HTMLElement>
  open: boolean
  keyToElementId(key: Key): string
  dialogKey?: Key | null
  onClose(reason: 'keyboard'): void
}) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    onClose('keyboard')
    return
  }

  if (open && event.key === 'Tab') trapDialogFocus(event, keyToElementId(dialogKey ?? fallbackDialogKey()))
}

export function emitControlledDialogClose({
  config,
  reason,
  key,
}: {
  config: ReactControlledDialogConfig
  reason: PatternEventReason
  key?: Key | null
}) {
  const dialogKey = key ?? fallbackDialogKey()
  config.onEvent?.({ type: 'dismiss', key: dialogKey, meta: { reason } })
  config.onOpenChange(false, { reason, key: dialogKey })
}

export function dialogKey(): Key {
  return fallbackDialogKey()
}

function focusInitialDialogTarget({
  data,
  keyToElementId,
  dialogKey,
  initialFocusKey,
}: {
  data: PatternData
  keyToElementId(key: Key): string
  dialogKey?: Key | null
  initialFocusKey?: Key
}) {
  const root = document.getElementById(keyToElementId(dialogKey ?? fallbackDialogKey()))
  const targetKey = initialFocusKey ?? data.refs?.initialFocusKey
  const target = targetKey ? document.getElementById(keyToElementId(targetKey)) : root?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
  const focusTarget = target ?? root
  focusTarget?.focus({ preventScroll: true })
}

function fallbackDialogKey(): Key {
  return 'dialog'
}

function trapDialogFocus(event: KeyboardEvent<HTMLElement>, dialogElementId: string) {
  const root = document.getElementById(dialogElementId)
  const items = root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : []
  if (items.length === 0) {
    event.preventDefault()
    return
  }
  const first = items[0]!
  const last = items[items.length - 1]!
  const active = document.activeElement as HTMLElement | null
  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

function resolveDialogFocusTarget(target: ReactDialogFocusTarget | undefined): HTMLElement | null {
  if (!target) return null
  if (typeof target === 'function') return target()
  if ('current' in target) return target.current
  return target
}
