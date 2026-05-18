import { useLayoutEffect, useRef } from 'react'
import type { Key, PatternData, PatternDefinition, PatternEvent, PatternOptions } from '../schema'
import { reducePatternData } from '../kernel/patternReducer'

export function useRovingFocusEventHandler({
  definition,
  data,
  options,
  keyToElementId,
  keyboardFocusKeyRef,
  onEvent,
}: {
  definition: PatternDefinition
  data: PatternData
  options: PatternOptions
  keyToElementId: (key: Key) => string
  keyboardFocusKeyRef?: { current: Key | null }
  onEvent: (event: PatternEvent) => void
}) {
  const pendingFocusKeyRef = useRef<Key | null>(null)
  const delayedFocusTimerRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (!usesRovingFocus(definition, options)) return
    const pendingFocusKey = pendingFocusKeyRef.current
    if (!pendingFocusKey || pendingFocusKey !== data.state?.activeKey) return
    if (delayedFocusTimerRef.current !== null) {
      window.clearTimeout(delayedFocusTimerRef.current)
      delayedFocusTimerRef.current = null
    }
    pendingFocusKeyRef.current = null
    document.getElementById(keyToElementId(pendingFocusKey))?.focus({ preventScroll: true })
  }, [data.state?.activeKey, definition, keyToElementId, options])

  useLayoutEffect(() => {
    return () => {
      if (delayedFocusTimerRef.current !== null) window.clearTimeout(delayedFocusTimerRef.current)
    }
  }, [])

  return (event: PatternEvent) => {
    let nextFocusKey: Key | null = null
    if (shouldFocusAfterControlledUpdate(event, definition, options)) {
      nextFocusKey = resolveEventActiveKey(definition, data, event)
      pendingFocusKeyRef.current = nextFocusKey
      if (keyboardFocusKeyRef) keyboardFocusKeyRef.current = nextFocusKey
    } else if (event.meta?.reason === 'pointer' && keyboardFocusKeyRef) {
      keyboardFocusKeyRef.current = null
    }
    onEvent(event)
    if (nextFocusKey) {
      if (delayedFocusTimerRef.current !== null) window.clearTimeout(delayedFocusTimerRef.current)
      delayedFocusTimerRef.current = window.setTimeout(() => {
        delayedFocusTimerRef.current = null
        document.getElementById(keyToElementId(nextFocusKey))?.focus({ preventScroll: true })
      })
    }
  }
}

export function shouldFocusAfterControlledUpdate(event: PatternEvent, definition: PatternDefinition, options: PatternOptions) {
  if (!usesRovingFocus(definition, options)) return false
  const reason = event.meta?.reason
  return (event.type === 'navigate' || event.type === 'focus') && (reason === 'keyboard' || reason === 'typeahead')
}

function usesRovingFocus(definition: PatternDefinition, options: PatternOptions) {
  return definition.focusModel === 'rovingTabIndex' && options.focusStrategy !== 'ariaActiveDescendant'
}

function resolveEventActiveKey(definition: PatternDefinition, data: PatternData, event: PatternEvent): Key | null {
  if (event.type === 'focus') return event.key
  return reducePatternData(definition, data, event).state?.activeKey ?? null
}
