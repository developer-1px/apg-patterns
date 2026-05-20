import type { PatternData } from '../../../../src/react'
import { attrLine } from '../../shared/inspect/utils'

export function renderSliderInspect(data: PatternData) {
  const key = data.relations?.rootKeys?.[0]
  if (!key) return ''
  return ['slider', attrLine({ 'aria-label': data.items[key]?.label, 'aria-valuenow': data.state?.valueByKey?.[key] }, ['aria-label', 'aria-valuenow'])].filter(Boolean).join('\n')
}
