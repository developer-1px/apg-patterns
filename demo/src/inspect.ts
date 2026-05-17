import { gridRows, type PatternData, type PatternOptions } from '../../src'
import type { PatternKey } from './patterns'

export function renderAriaTree(data: PatternData, options: PatternOptions) {
  const activeKey = data.state?.activeKey
  const treeProps = getInspectableTreeProps(data, options)
  const lines = [`tree`, attrLine(treeProps, ['aria-label', 'aria-labelledby', 'aria-activedescendant', 'tabIndex'])]

  for (const key of getVisible(data)) {
    const props = getInspectableTreeItemProps(data, options, key)
    const label = data.items[key]?.label ?? key
    const marker = key === activeKey ? '>' : ' '
    lines.push(`${marker} treeitem ${key} "${label}"`)
    lines.push(`  ${attrLine(props, ['id', 'tabIndex', 'aria-selected', 'aria-expanded', 'aria-level', 'aria-posinset', 'aria-setsize'])}`)
  }

  return lines.filter(Boolean).join('\n')
}

export function renderHtmlTree(data: PatternData, options: PatternOptions) {
  const treeProps = getInspectableTreeProps(data, options)
  const lines = [`<div role="${treeProps.role}"${htmlAttrs(treeProps, ['aria-label', 'aria-activedescendant', 'tabIndex'])}>`]

  for (const key of getVisible(data)) {
    const props = getInspectableTreeItemProps(data, options, key)
    const label = data.items[key]?.label ?? key
    lines.push(`  <div role="${props.role}"${htmlAttrs(props, ['id', 'tabIndex', 'aria-selected', 'aria-expanded', 'aria-level', 'aria-posinset', 'aria-setsize'])}>`)
    lines.push(`    <button aria-label="toggle ${key}">${data.relations?.childrenByKey?.[key]?.length ? (isExpanded(data, key) ? '-' : '+') : ''}</button>`)
    lines.push(`    ${label}`)
    lines.push('  </div>')
  }

  lines.push('</div>')
  return lines.join('\n')
}

export function renderStaticInspect(patternKey: PatternKey) {
  if (patternKey === 'grid') {
    return ['grid', 'aria-label="Transactions"', '  columnheader "Date" aria-rowindex=1 aria-colindex=1', '  columnheader "Type" aria-rowindex=1 aria-colindex=2', '  columnheader "Amount" aria-rowindex=1 aria-colindex=3', '  gridcell "Deposit" tabIndex=0'].join('\n')
  }
  return ''
}

export function renderTabsInspect(data: PatternData) {
  const activeKey = data.state?.activeKey
  const selectedKey = data.state?.selectedKeys?.[0]
  const lines = ['tablist', attrLine({ 'aria-label': data.refs?.label }, ['aria-label'])]

  ;(data.relations?.rootKeys ?? []).forEach((key) => {
    const label = data.items[key]?.label ?? key
    const marker = key === activeKey ? '>' : ' '
    lines.push(`${marker} tab "${label}" ${attrLine({
      tabIndex: key === activeKey ? 0 : -1,
      'aria-selected': key === selectedKey,
      'aria-controls': data.relations?.controlsByKey?.[key],
    }, ['tabIndex', 'aria-selected', 'aria-controls'])}`.trimEnd())
  })

  const panelKey = selectedKey ? data.relations?.controlsByKey?.[selectedKey]?.[0] : undefined
  if (panelKey) lines.push(`  tabpanel "${data.items[panelKey]?.label ?? panelKey}" aria-labelledby=${JSON.stringify(data.relations?.ownerByKey?.[panelKey])}`)

  return lines.filter(Boolean).join('\n')
}

export function renderListboxInspect(data: PatternData) {
  const activeKey = data.state?.activeKey
  const lines = ['listbox', attrLine({ 'aria-label': data.refs?.label }, ['aria-label'])]

  ;(data.relations?.rootKeys ?? []).forEach((key) => {
    const label = data.items[key]?.label ?? key
    const marker = key === activeKey ? '>' : ' '
    const selected = data.state?.selectedKeys?.includes(key) || undefined
    const disabled = data.state?.disabledKeys?.includes(key) || undefined
    lines.push(`${marker} option "${label}" ${attrLine({
      tabIndex: key === activeKey ? 0 : -1,
      'aria-selected': selected,
      'aria-disabled': disabled,
    }, ['tabIndex', 'aria-selected', 'aria-disabled'])}`.trimEnd())
  })

  return lines.filter(Boolean).join('\n')
}

export function renderGridInspect(data: PatternData) {
  const activeKey = data.state?.activeKey
  const lines = ['grid', attrLine({ 'aria-label': data.refs?.label, 'aria-labelledby': data.refs?.labelledBy }, ['aria-label', 'aria-labelledby'])]
  const rows = gridRows(data)

  rows.forEach((row, rowIndex) => {
    row.forEach((key) => {
      const role = data.items[key]?.kind === 'columnheader' ? 'columnheader' : 'gridcell'
      const label = data.items[key]?.label ?? key
      const marker = key === activeKey ? '>' : ' '
      const selected = data.state?.selectedKeys?.includes(key) || undefined
      lines.push(`${marker} ${role} "${label}" ${attrLine({
        tabIndex: key === activeKey ? 0 : -1,
        'aria-selected': role === 'gridcell' ? selected : undefined,
        'aria-rowindex': data.state?.rowIndexByKey?.[key],
        'aria-colindex': data.state?.columnIndexByKey?.[key],
        'aria-sort': data.state?.sortByKey?.[key],
      }, ['tabIndex', 'aria-selected', 'aria-rowindex', 'aria-colindex', 'aria-sort'])}`.trimEnd())
    })
  })

  return lines.filter(Boolean).join('\n')
}

function getVisible(data: PatternData) {
  const expanded = new Set(data.state?.expandedKeys ?? [])
  const visit = (key: string): string[] => [key, ...(expanded.has(key) ? (data.relations?.childrenByKey?.[key] ?? []).flatMap(visit) : [])]
  return (data.relations?.rootKeys ?? []).flatMap(visit)
}

function getInspectableTreeProps(data: PatternData, options: PatternOptions) {
  return {
    role: 'tree',
    'aria-label': data.refs?.label,
    'aria-labelledby': data.refs?.labelledBy,
    'aria-activedescendant': options.focusStrategy === 'ariaActiveDescendant' && data.state?.activeKey ? elementId(data.state.activeKey, options) : undefined,
    tabIndex: 0,
  }
}

function getInspectableTreeItemProps(data: PatternData, options: PatternOptions, key: string) {
  const hasChildren = Boolean(data.relations?.childrenByKey?.[key]?.length)
  const selected = data.state?.selectedKeys?.includes(key)
  const disabled = data.state?.disabledKeys?.includes(key)
  return {
    role: 'treeitem',
    id: elementId(key, options),
    tabIndex: options.focusStrategy === 'ariaActiveDescendant' ? undefined : key === data.state?.activeKey ? 0 : -1,
    'aria-selected': selected || undefined,
    'aria-disabled': disabled || undefined,
    'aria-expanded': hasChildren ? isExpanded(data, key) : undefined,
    'aria-level': data.state?.levelByKey?.[key],
    'aria-posinset': data.state?.posInSetByKey?.[key],
    'aria-setsize': data.state?.setSizeByKey?.[key],
  }
}

function isExpanded(data: PatternData, key: string) {
  return data.state?.expandedKeys?.includes(key) ?? false
}

function elementId(key: string, options: PatternOptions) {
  return `${options.elementIdPrefix ?? 'treeitem-'}${key}`
}

function attrLine(props: Record<string, unknown>, names: readonly string[]) {
  return names
    .filter((name) => props[name] !== undefined)
    .map((name) => `${name}=${JSON.stringify(props[name])}`)
    .join(' ')
}

function htmlAttrs(props: Record<string, unknown>, names: readonly string[]) {
  return names
    .filter((name) => props[name] !== undefined)
    .map((name) => ` ${htmlAttrName(name)}="${String(props[name])}"`)
    .join('')
}

function htmlAttrName(name: string) {
  return name === 'tabIndex' ? 'tabindex' : name
}
