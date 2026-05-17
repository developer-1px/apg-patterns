import type { PatternData } from '../../../../src'
import { attrLine } from '../../shared/inspect/utils'

export function renderListboxInspect(data: PatternData) {
  const activeKey = data.state?.activeKey
  const lines = ['listbox', attrLine({ 'aria-label': data.refs?.label }, ['aria-label'])]
  ;(data.relations?.rootKeys ?? []).forEach((key) => {
    const marker = key === activeKey ? '>' : ' '
    lines.push(`${marker} option "${data.items[key]?.label ?? key}" ${attrLine({
      tabIndex: key === activeKey ? 0 : -1,
      'aria-selected': data.state?.selectedKeys?.includes(key) || undefined,
      'aria-disabled': data.state?.disabledKeys?.includes(key) || undefined,
    }, ['tabIndex', 'aria-selected', 'aria-disabled'])}`.trimEnd())
  })
  return lines.filter(Boolean).join('\n')
}
