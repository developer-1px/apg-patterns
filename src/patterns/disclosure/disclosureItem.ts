import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'

export interface ReactDisclosureItem {
  key: Key
  label: string
  panelKey: Key | null
  expanded: boolean
  triggerProps: ReactPatternProps
  panelProps: ReactPatternProps | null
}

export function createDisclosureItems({
  runtime,
  data,
  expandedKeys,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  data: PatternData
  expandedKeys: readonly Key[]
}): readonly ReactDisclosureItem[] {
  return (data.relations?.rootKeys ?? []).map((key) => {
    const panelKey = data.relations?.controlsByKey?.[key]?.[0] ?? null
    return {
      key,
      label: data.items[key]?.label ?? key,
      panelKey,
      expanded: expandedKeys.includes(key),
      triggerProps: createDisclosureTriggerProps(runtime, key),
      panelProps: panelKey ? reactProps(runtime.getItemProps('panel', panelKey)) : null,
    }
  })
}

export function createDisclosureTriggerProps(runtime: ReturnType<typeof createPatternRuntime>, key: Key): ReactPatternProps {
  const { onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getItemProps('trigger', key))
  const rootKeyDown = runtime.getRootKeyboardHandler()
  return {
    ...props,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => rootKeyDown(reactKeyInput(event)),
  }
}
