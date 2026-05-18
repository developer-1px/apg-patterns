import type { KeyboardEvent } from 'react'
import type { PatternData, PatternEvent } from '../../../../src'

export function useMenubarSubmenuKeyboard({
  data,
  ownerKey,
  rootKeys,
  children,
  activeKey,
  onEvent,
  close,
}: {
  data: PatternData
  ownerKey: string
  rootKeys: readonly string[]
  children: readonly string[]
  activeKey: string | null | undefined
  onEvent: (event: PatternEvent) => void
  close: () => void
}) {
  const focusOwner = () => {
    onEvent({ type: 'focus', key: ownerKey, meta: { reason: 'keyboard' } })
    document.getElementById(`menubar-${ownerKey}`)?.focus({ preventScroll: true })
  }
  const focusChild = (key: string | undefined) => {
    if (key) onEvent({ type: 'focus', key, meta: { reason: 'keyboard' } })
  }
  const openSibling = (direction: 'next' | 'previous') => {
    const target = siblingKey(rootKeys, ownerKey, direction)
    if (!target) return
    onEvent({ type: 'focus', key: target, meta: { reason: 'keyboard' } })
    const targetChildren = data.relations?.childrenByKey?.[target] ?? []
    if (targetChildren.length > 0) {
      onEvent({ type: 'expand', key: target, expanded: true })
      focusChild(targetChildren[0])
    }
    close()
  }

  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      focusOwner()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusChild(stepKey(children, activeKey, 1))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusChild(stepKey(children, activeKey, -1))
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      focusChild(children[0])
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      focusChild(children[children.length - 1])
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      openSibling('next')
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      openSibling('previous')
    }
  }
}

function stepKey(keys: readonly string[], activeKey: string | null | undefined, delta: 1 | -1) {
  if (keys.length === 0) return undefined
  const index = activeKey ? keys.indexOf(activeKey) : -1
  if (index === -1) return keys[delta === 1 ? 0 : keys.length - 1]
  return keys[(index + delta + keys.length) % keys.length]
}

function siblingKey(keys: readonly string[], key: string, direction: 'next' | 'previous') {
  if (keys.length === 0) return undefined
  const index = keys.indexOf(key)
  if (index === -1) return undefined
  return keys[(index + (direction === 'next' ? 1 : -1) + keys.length) % keys.length]
}
