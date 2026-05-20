import type { z } from 'zod'
import { validateRefsRefs, validateRelationRefs, validateStateRefs } from './patternDataRefValidators'

/**
 * Cross-field referential integrity checks for PatternData.
 * Every relations/state/refs key must exist in items.
 * Attached through PatternDataSchema.superRefine.
 */
export const validatePatternDataRefs = (
  value: {
    items: Record<string, unknown>
    relations?: {
      rootKeys?: readonly string[]
      childrenByKey?: Record<string, readonly string[]>
      ownerByKey?: Record<string, string>
      controlsByKey?: Record<string, readonly string[]>
      rowKeys?: readonly string[]
      columnKeys?: readonly string[]
      cells?: readonly { rowKey: string; columnKey: string; cellKey: string }[]
    }
    state?: {
      activeKey?: string | null
      anchorKey?: string | null
      extentKey?: string | null
      selectedKeys?: readonly string[]
      expandedKeys?: readonly string[]
      disabledKeys?: readonly string[]
      checkedByKey?: Record<string, unknown>
      pressedByKey?: Record<string, unknown>
      currentByKey?: Record<string, unknown>
      invalidByKey?: Record<string, unknown>
      requiredKeys?: readonly string[]
      busyKeys?: readonly string[]
      modalKeys?: readonly string[]
      levelByKey?: Record<string, unknown>
      posInSetByKey?: Record<string, unknown>
      setSizeByKey?: Record<string, unknown>
      rowIndexByKey?: Record<string, unknown>
      columnIndexByKey?: Record<string, unknown>
      sortByKey?: Record<string, unknown>
      valueByKey?: Record<string, unknown>
      rangeValueByKey?: Record<string, unknown>
      typeaheadTextByKey?: Record<string, unknown>
    }
    refs?: {
      domainIdByKey?: Record<string, unknown>
      pointerByKey?: Record<string, unknown>
    }
  },
  ctx: z.RefinementCtx,
) => {
  const keys = new Set(Object.keys(value.items))
  validateRelationRefs(value.relations, keys, ctx)
  validateStateRefs(value.state, keys, ctx)
  validateRefsRefs(value.refs, keys, ctx)
}
