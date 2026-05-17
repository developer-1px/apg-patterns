import type { PatternData } from '../../src'
import { attrLine } from './inspectUtils'

export function renderDisclosureInspect(data: PatternData) {
  const rootKeys = data.relations?.rootKeys ?? []
  if (!rootKeys.length) return ''
  const expandedKeys = data.state?.expandedKeys ?? []
  const lines: string[] = []
  for (const triggerKey of rootKeys) {
    const expanded = expandedKeys.includes(triggerKey)
    const panelKey = data.relations?.controlsByKey?.[triggerKey]?.[0]
    lines.push(`button "${data.items[triggerKey]?.label ?? triggerKey}" aria-expanded=${expanded} aria-controls=${JSON.stringify(panelKey ?? '')}`)
    if (panelKey && expanded) lines.push(`  region aria-labelledby=${JSON.stringify(triggerKey)}`)
  }
  return lines.join('\n')
}

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

export function renderSliderInspect(data: PatternData) {
  const key = data.relations?.rootKeys?.[0]
  if (!key) return ''
  return ['slider', attrLine({ 'aria-label': data.items[key]?.label, 'aria-valuenow': data.state?.valueByKey?.[key] }, ['aria-label', 'aria-valuenow'])].filter(Boolean).join('\n')
}

function checkboxLine(data: PatternData, key: string) {
  return `checkbox "${data.items[key]?.label ?? key}" ${attrLine({ 'aria-checked': data.state?.checkedByKey?.[key] ?? false }, ['aria-checked'])}`
}
