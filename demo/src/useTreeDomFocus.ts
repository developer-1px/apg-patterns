import { useLayoutEffect } from 'react'
import type { PatternData, PatternOptions } from '../../src'

export function useTreeDomFocus(
  data: PatternData,
  focusStrategy: PatternOptions['focusStrategy'] = 'rovingTabIndex',
) {
  useLayoutEffect(() => {
    const activeKey = data.state?.activeKey
    if (!activeKey) return

    const target =
      focusStrategy === 'ariaActiveDescendant'
        ? document.querySelector<HTMLElement>('[role="tree"]')
        : document.getElementById(`treeitem-${CSS.escape(activeKey)}`)

    target?.focus({ preventScroll: true })
  }, [data.state?.activeKey, focusStrategy])
}
