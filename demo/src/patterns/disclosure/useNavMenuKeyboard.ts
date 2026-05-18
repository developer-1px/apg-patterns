import type { KeyboardEvent, RefObject } from 'react'
import type { PatternEvent } from '../../../../src'

export function useNavMenuKeyboard({
  containerRef,
  expandedKeys,
  onEvent,
}: {
  containerRef: RefObject<HTMLDivElement | null>
  expandedKeys: readonly string[]
  onEvent: (event: PatternEvent) => void
}) {
  const focusButton = (key: string) => containerRef.current?.querySelector<HTMLElement>(`[data-nav-button="${key}"]`)?.focus()
  const focusFirstLink = (key: string) => containerRef.current?.querySelector<HTMLElement>(`[data-nav-panel="${key}"] a`)?.focus()
  const focusLastLink = (key: string) => {
    const links = containerRef.current?.querySelectorAll<HTMLElement>(`[data-nav-panel="${key}"] a`)
    if (links?.length) links[links.length - 1].focus()
  }
  const focusSiblingLink = (key: string, current: HTMLElement, dir: 1 | -1) => {
    const links = Array.from(containerRef.current?.querySelectorAll<HTMLElement>(`[data-nav-panel="${key}"] a`) ?? [])
    const index = links.indexOf(current)
    if (index < 0) return
    links[(index + dir + links.length) % links.length]?.focus()
  }
  const closeOthers = (key: string) => expandedKeys.filter((expandedKey) => expandedKey !== key).forEach((expandedKey) => onEvent({ type: 'expand', key: expandedKey, expanded: false }))

  const onButtonKey = (key: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const expanded = expandedKeys.includes(key)
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault()
      closeOthers(key)
      onEvent({ type: 'expand', key, expanded: !expanded })
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      if (expanded) onEvent({ type: 'expand', key, expanded: false })
      focusButton(key)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!expanded) {
        closeOthers(key)
        onEvent({ type: 'expand', key, expanded: true })
        setTimeout(() => focusFirstLink(key), 0)
      } else {
        focusFirstLink(key)
      }
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (expanded) focusLastLink(key)
      return
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const focusables = getAllFocusableTopLevel(containerRef.current)
      const index = focusables.findIndex((el) => el.dataset.navKey === key || el.dataset.navButton === key)
      if (index < 0) return
      if (expanded) onEvent({ type: 'expand', key, expanded: false })
      focusables[(index + (event.key === 'ArrowRight' ? 1 : -1) + focusables.length) % focusables.length]?.focus()
    }
  }

  const onLinkKey = (key: string) => (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onEvent({ type: 'expand', key, expanded: false })
      focusButton(key)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusSiblingLink(key, event.currentTarget, event.key === 'ArrowDown' ? 1 : -1)
    }
  }

  return { closeOthers, onButtonKey, onLinkKey }
}

function getAllFocusableTopLevel(root: HTMLElement | null): HTMLElement[] {
  return root ? Array.from(root.querySelectorAll<HTMLElement>('[data-nav-key]')) : []
}
