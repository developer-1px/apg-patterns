import { useLayoutEffect } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'

export function useMenuButtonActiveDescendantFocus({
  data,
  expanded,
  focusStrategy,
  menuKey,
  runtime,
}: {
  data: PatternData
  expanded: boolean
  focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant'
  menuKey: Key | null
  runtime: PatternRuntime
}): void {
  useLayoutEffect(() => {
    if (focusStrategy !== 'ariaActiveDescendant' || !expanded || !menuKey) return
    const reason = data.state?.lastEventReason
    if (reason !== 'open' && reason !== 'keyboard' && reason !== 'typeahead') return
    document.getElementById(runtime.keyToElementId(menuKey))?.focus({ preventScroll: true })
  }, [data.state?.activeKey, data.state?.lastEventReason, expanded, focusStrategy, menuKey, runtime])
}
