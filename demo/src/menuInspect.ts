import type { PatternData } from '../../src'
import { attrLine } from './inspectUtils'

export function renderMenuInspect(
  data: PatternData,
  apgPattern: 'menubar' | 'menu-button',
  focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant' = 'rovingTabIndex',
) {
  return apgPattern === 'menubar'
    ? renderMenubarInspect(data)
    : renderMenuButtonInspect(data, focusStrategy)
}

function renderMenubarInspect(data: PatternData) {
  const activeKey = data.state?.activeKey
  const expandedKeys = data.state?.expandedKeys ?? []
  const lines = ['menubar', attrLine({ 'aria-label': data.refs?.label, 'aria-orientation': 'horizontal' }, ['aria-label', 'aria-orientation'])]
  ;(data.relations?.rootKeys ?? []).forEach((key) => {
    const hasPopup = (data.relations?.childrenByKey?.[key]?.length ?? 0) > 0
    const expanded = expandedKeys.includes(key)
    lines.push(`${key === activeKey ? '>' : ' '} menuitem "${data.items[key]?.label ?? key}" ${attrLine({
      tabIndex: key === activeKey ? 0 : -1,
      'aria-haspopup': hasPopup ? 'menu' : undefined,
      'aria-expanded': hasPopup ? expanded : undefined,
      'aria-disabled': data.state?.disabledKeys?.includes(key) || undefined,
    }, ['tabIndex', 'aria-haspopup', 'aria-expanded', 'aria-disabled'])}`.trimEnd())
    if (hasPopup && expanded) appendSubmenuLines(lines, data, key)
  })
  return lines.filter(Boolean).join('\n')
}

function renderMenuButtonInspect(data: PatternData, focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant') {
  const triggerKey = data.relations?.rootKeys?.[0]
  if (!triggerKey) return ''
  const menuKey = data.relations?.controlsByKey?.[triggerKey]?.[0]
  const expanded = data.state?.expandedKeys?.includes(triggerKey) ?? false
  const activeKey = data.state?.activeKey
  const lines = [
    `button "${data.items[triggerKey]?.label ?? triggerKey}" ${attrLine({
      'aria-haspopup': 'menu',
      'aria-expanded': expanded,
      'aria-controls': menuKey,
    }, ['aria-haspopup', 'aria-expanded', 'aria-controls'])}`,
  ]
  if (!expanded || !menuKey) return lines.filter(Boolean).join('\n')
  lines.push(`  menu ${attrLine({
    'aria-labelledby': triggerKey,
    'aria-activedescendant': focusStrategy === 'ariaActiveDescendant' && activeKey ? `mb-${activeKey}` : undefined,
  }, ['aria-labelledby', 'aria-activedescendant'])}`.trimEnd())
  ;(data.relations?.childrenByKey?.[menuKey] ?? []).forEach((key) => {
    lines.push(`  ${key === activeKey ? '>' : ' '} menuitem "${data.items[key]?.label ?? key}" ${attrLine({
      tabIndex: focusStrategy === 'rovingTabIndex' ? (key === activeKey ? 0 : -1) : undefined,
      'aria-disabled': data.state?.disabledKeys?.includes(key) || undefined,
    }, ['tabIndex', 'aria-disabled'])}`.trimEnd())
  })
  return lines.filter(Boolean).join('\n')
}

function appendSubmenuLines(lines: string[], data: PatternData, key: string) {
  ;(data.relations?.childrenByKey?.[key] ?? []).forEach((childKey) => {
    const item = data.items[childKey] as { label?: string; kind?: string } | undefined
    const role = item?.kind === 'menuitemcheckbox' ? 'menuitemcheckbox' : item?.kind === 'menuitemradio' ? 'menuitemradio' : 'menuitem'
    lines.push(`    ${role} "${item?.label ?? childKey}" ${attrLine({
      'aria-checked': role === 'menuitemcheckbox' || role === 'menuitemradio' ? Boolean(data.state?.checkedByKey?.[childKey]) : undefined,
      'aria-disabled': data.state?.disabledKeys?.includes(childKey) || undefined,
    }, ['aria-checked', 'aria-disabled'])}`.trimEnd())
  })
}
