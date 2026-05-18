import { useLayoutEffect, useRef } from 'react'
import type { Key, PatternData, PatternDefinition } from '../schema'
import { createPatternRuntime, type CreatePatternRuntimeInput, type PatternRuntime } from '../kernel/patternRuntime'
import { runPatternEffects } from './reactEffectRunner'
import { useRovingFocusEventHandler } from './reactRovingFocus'
export { handlePatternTrapFocus } from './reactPatternTrapFocus'
export { useRovingFocusEventHandler } from './reactRovingFocus'

export function usePatternEffects({
  definition,
  data,
  keyToElementId,
}: {
  definition: PatternDefinition
  data: PatternData
  keyToElementId: (key: Key) => string
}) {
  const previousMatches = useRef<boolean[]>([])

  useLayoutEffect(() => {
    previousMatches.current = runPatternEffects({ definition, data, keyToElementId, previousMatches: previousMatches.current })
  }, [data, definition, keyToElementId])
}

export function useReactPatternRuntime(input: CreatePatternRuntimeInput): PatternRuntime {
  const keyToElementId = input.keyToElementId ?? ((key: Key) => `${key}`)
  const keyboardFocusKeyRef = useRef<Key | null>(null)
  const onEvent = useRovingFocusEventHandler({
    definition: input.definition,
    data: input.data,
    options: input.options ?? {},
    keyToElementId,
    keyboardFocusKeyRef,
    onEvent: input.onEvent,
  })
  const runtime = createPatternRuntime({ ...input, onEvent, keyToElementId })
  usePatternEffects({ definition: runtime.definition, data: runtime.data, keyToElementId: runtime.keyToElementId })
  return withKeyboardFocusVisibleProps(runtime, keyboardFocusKeyRef.current)
}

function withKeyboardFocusVisibleProps(runtime: PatternRuntime, keyboardFocusKey: Key | null): PatternRuntime {
  if (!keyboardFocusKey) return runtime
  const addFocusVisible = (props: Record<string, unknown>, key?: Key) => {
    if (key !== keyboardFocusKey) return props
    return { ...props, 'data-focus-visible': '' }
  }
  return {
    ...runtime,
    getItemProps: (partName, key) => addFocusVisible(runtime.getItemProps(partName, key), key),
    getPartProps: (partName, key) => addFocusVisible(runtime.getPartProps(partName, key), key),
  }
}
