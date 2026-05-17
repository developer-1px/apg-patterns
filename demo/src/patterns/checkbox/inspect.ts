import type { PatternData } from '../../../../src'
import { attrLine } from '../../shared/inspect/utils'

export function renderCheckboxInspect(data: PatternData) {
  const rootKeys = data.relations?.rootKeys ?? []
  if (rootKeys.length === 0) return ''
  if (rootKeys.length === 1) return checkboxLine(data, rootKeys[0]!)
  const [parentKey, ...childKeys] = rootKeys
  return [
    checkboxLine(data, parentKey!),
    `group ${attrLine({ 'aria-label': data.refs?.label }, ['aria-label'])}`.trimEnd(),
    ...childKeys.map((key) => `  ${checkboxLine(data, key)}`),
  ].join('\n')
}

function checkboxLine(data: PatternData, key: string) {
  return `checkbox "${data.items[key]?.label ?? key}" ${attrLine({ 'aria-checked': data.state?.checkedByKey?.[key] ?? false }, ['aria-checked'])}`
}
