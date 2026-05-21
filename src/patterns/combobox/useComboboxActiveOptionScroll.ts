import { useLayoutEffect } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { comboboxRootKey } from './navigation'

export function useComboboxActiveOptionScroll({
  activeKey,
  open,
  runtime,
}: {
  activeKey: Key | null | undefined
  open: boolean
  runtime: PatternRuntime
}): void {
  useLayoutEffect(() => {
    if (!open || !activeKey || activeKey === comboboxRootKey) return
    const activeOption = document.getElementById(runtime.keyToElementId(activeKey))
    if (typeof activeOption?.scrollIntoView !== 'function') return
    activeOption.scrollIntoView({ block: 'nearest' })
  }, [activeKey, open, runtime])
}
