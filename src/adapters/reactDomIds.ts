import { useMemo } from 'react'
import type { Key, PatternOptions } from '../schema'
import { createElementId, createElementIdPrefix } from '../kernel/domIds'

export function usePatternElementId(options: PatternOptions | undefined, defaultPrefix: string): (key: Key) => string {
  const elementIdPrefix = options?.elementIdPrefix

  return useMemo(() => {
    const prefix = createElementIdPrefix(elementIdPrefix ? { elementIdPrefix } : undefined, defaultPrefix)
    return (key: Key) => createElementId(prefix, key)
  }, [defaultPrefix, elementIdPrefix])
}
