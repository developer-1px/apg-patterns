import type { PatternData } from '../../../../src'
import { attrLine } from '../../shared/inspect/utils'

export function renderTabsInspect(data: PatternData) {
  const activeKey = data.state?.activeKey
  const selectedKey = data.state?.selectedKeys?.[0]
  const lines = ['tablist', attrLine({ 'aria-label': data.refs?.label }, ['aria-label'])]
  ;(data.relations?.rootKeys ?? []).forEach((key) => {
    const marker = key === activeKey ? '>' : ' '
    lines.push(`${marker} tab "${data.items[key]?.label ?? key}" ${attrLine({
      tabIndex: key === activeKey ? 0 : -1,
      'aria-selected': key === selectedKey,
      'aria-controls': data.relations?.controlsByKey?.[key],
    }, ['tabIndex', 'aria-selected', 'aria-controls'])}`.trimEnd())
  })
  const panelKey = selectedKey ? data.relations?.controlsByKey?.[selectedKey]?.[0] : undefined
  if (panelKey) lines.push(`  tabpanel "${data.items[panelKey]?.label ?? panelKey}" aria-labelledby=${JSON.stringify(data.relations?.ownerByKey?.[panelKey])}`)
  return lines.filter(Boolean).join('\n')
}
