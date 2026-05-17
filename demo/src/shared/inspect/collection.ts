import { gridRows, type PatternData } from '../../../../src'
import { attrLine } from './utils'

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

export function renderGridInspect(data: PatternData) {
  const activeKey = data.state?.activeKey
  const lines = ['grid', attrLine({ 'aria-label': data.refs?.label, 'aria-labelledby': data.refs?.labelledBy }, ['aria-label', 'aria-labelledby'])]
  gridRows(data).forEach((row) => {
    row.forEach((key) => {
      const role = data.items[key]?.kind === 'columnheader' ? 'columnheader' : 'gridcell'
      const marker = key === activeKey ? '>' : ' '
      lines.push(`${marker} ${role} "${data.items[key]?.label ?? key}" ${attrLine({
        tabIndex: key === activeKey ? 0 : -1,
        'aria-selected': role === 'gridcell' ? data.state?.selectedKeys?.includes(key) || undefined : undefined,
        'aria-rowindex': data.state?.rowIndexByKey?.[key],
        'aria-colindex': data.state?.columnIndexByKey?.[key],
        'aria-sort': data.state?.sortByKey?.[key],
      }, ['tabIndex', 'aria-selected', 'aria-rowindex', 'aria-colindex', 'aria-sort'])}`.trimEnd())
    })
  })
  return lines.filter(Boolean).join('\n')
}
