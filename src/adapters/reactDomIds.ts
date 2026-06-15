import { useId, useLayoutEffect, useMemo } from 'react'
import type { Key, PatternOptions } from '../schema'
import { createElementId, createElementIdPrefix } from '../kernel/domIds'

const activeDefaultPrefixCounts = new Map<string, number>()

export function usePatternElementId(options: PatternOptions | undefined, defaultPrefix: string): (key: Key) => string {
  const elementIdPrefix = options?.elementIdPrefix
  const instanceId = useId()

  const prefix = useMemo(() => {
    if (elementIdPrefix) return createElementIdPrefix({ elementIdPrefix }, defaultPrefix)

    const activeCount = activeDefaultPrefixCounts.get(defaultPrefix) ?? 0
    activeDefaultPrefixCounts.set(defaultPrefix, activeCount + 1)
    return createElementIdPrefix(undefined, defaultPrefix, activeCount === 0 ? undefined : instanceId)
  }, [defaultPrefix, elementIdPrefix, instanceId])

  useLayoutEffect(() => {
    if (elementIdPrefix) return undefined
    return () => {
      const activeCount = activeDefaultPrefixCounts.get(defaultPrefix) ?? 0
      if (activeCount <= 1) activeDefaultPrefixCounts.delete(defaultPrefix)
      else activeDefaultPrefixCounts.set(defaultPrefix, activeCount - 1)
    }
  }, [defaultPrefix, elementIdPrefix])

  return useMemo(() => {
    return (key: Key) => createElementId(prefix, key)
  }, [prefix])
}
