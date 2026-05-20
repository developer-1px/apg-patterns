import type { PatternData } from '../../../../src/react'

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
