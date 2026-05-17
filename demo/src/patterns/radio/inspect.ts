import type { PatternData } from '../../../../src'
import { attrLine } from '../../shared/inspect/utils'

export function renderRadioInspect(data: PatternData) {
  const activeKey = data.state?.activeKey
  const lines = ['radiogroup', attrLine({ 'aria-label': data.refs?.label }, ['aria-label'])]
  ;(data.relations?.rootKeys ?? []).forEach((key) => {
    const marker = key === activeKey ? '>' : ' '
    lines.push(`${marker} radio "${data.items[key]?.label ?? key}" ${attrLine({
      tabIndex: key === activeKey ? 0 : -1,
      'aria-checked': data.state?.selectedKeys?.includes(key) ?? false,
    }, ['tabIndex', 'aria-checked'])}`.trimEnd())
  })
  return lines.join('\n')
}
