import type { Key, PatternDefinition } from '../schema'
import { resolveStateProjection, type PatternRuntimeContext } from './patternKernel'

export function resolveRuntimeItemState({
  definition,
  partName,
  key,
  context,
}: {
  definition: PatternDefinition
  partName: string
  key: Key
  context(key?: Key): PatternRuntimeContext
}): Record<string, unknown> {
  const part = definition.parts[partName]
  if (!part) return {}
  const ctx = context(key)
  const out: Record<string, unknown> = {}
  for (const projection of part.state ?? []) {
    out[projection.name] = resolveStateProjection(projection.from, ctx)
  }
  return out
}
