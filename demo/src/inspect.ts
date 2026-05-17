import { gridRows, type PatternData, type PatternOptions } from '../../src'

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

export function renderDisclosureInspect(data: PatternData) {
  const rootKeys = data.relations?.rootKeys ?? []
  if (!rootKeys.length) return ''
  const expandedKeys = data.state?.expandedKeys ?? []
  const lines: string[] = []
  for (const triggerKey of rootKeys) {
    const expanded = expandedKeys.includes(triggerKey)
    const panelKey = data.relations?.controlsByKey?.[triggerKey]?.[0]
    lines.push(`button "${data.items[triggerKey]?.label ?? triggerKey}" aria-expanded=${expanded} aria-controls=${JSON.stringify(panelKey ?? '')}`)
    if (panelKey && expanded) {
      lines.push(`  region aria-labelledby=${JSON.stringify(triggerKey)}`)
    }
  }
  return lines.join('\n')
}

export function renderCheckboxInspect(data: PatternData) {
  const rootKeys = data.relations?.rootKeys ?? []
  if (rootKeys.length === 0) return ''
  if (rootKeys.length === 1) {
    const key = rootKeys[0]!
    return `checkbox "${data.items[key]?.label ?? key}" ${attrLine({
      'aria-checked': data.state?.checkedByKey?.[key] ?? false,
    }, ['aria-checked'])}`
  }
  const [parentKey, ...childKeys] = rootKeys
  const lines: string[] = []
  lines.push(`checkbox "${data.items[parentKey!]?.label ?? parentKey}" ${attrLine({
    'aria-checked': data.state?.checkedByKey?.[parentKey!] ?? false,
  }, ['aria-checked'])}`)
  lines.push(`group ${attrLine({ 'aria-label': data.refs?.label }, ['aria-label'])}`.trimEnd())
  for (const key of childKeys) {
    lines.push(`  checkbox "${data.items[key]?.label ?? key}" ${attrLine({
      'aria-checked': data.state?.checkedByKey?.[key] ?? false,
    }, ['aria-checked'])}`)
  }
  return lines.join('\n')
}

export function renderRadioInspect(data: PatternData) {
  const activeKey = data.state?.activeKey
  const lines = ['radiogroup', attrLine({ 'aria-label': data.refs?.label }, ['aria-label'])]

  ;(data.relations?.rootKeys ?? []).forEach((key) => {
    const label = data.items[key]?.label ?? key
    const marker = key === activeKey ? '>' : ' '
    lines.push(`${marker} radio "${label}" ${attrLine({
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

export function renderComboboxInspect(
  data: PatternData,
  variant: { autocomplete: 'none' | 'list' | 'both' },
) {
  const COMBOBOX_KEY = 'combobox'
  const expanded = data.state?.expandedKeys?.includes(COMBOBOX_KEY) ?? false
  const activeKey = data.state?.activeKey
  const lines = [
    'combobox',
    attrLine(
      {
        role: 'combobox',
        'aria-expanded': expanded,
        'aria-haspopup': 'listbox',
        'aria-autocomplete': variant.autocomplete,
        'aria-controls': 'combobox-popup',
        'aria-activedescendant': activeKey ? `combobox-option-${activeKey}` : undefined,
        'aria-label': data.refs?.label,
      },
      ['role', 'aria-expanded', 'aria-haspopup', 'aria-autocomplete', 'aria-controls', 'aria-activedescendant', 'aria-label'],
    ),
  ]
  if (expanded) {
    lines.push('listbox id="combobox-popup"')
    for (const key of Object.keys(data.items).filter((k) => k !== COMBOBOX_KEY)) {
      const label = data.items[key]?.label ?? key
      const marker = key === activeKey ? '>' : ' '
      const selected = data.state?.selectedKeys?.includes(key) || undefined
      lines.push(`${marker} option "${label}" ${attrLine({ id: `combobox-option-${key}`, 'aria-selected': selected }, ['id', 'aria-selected'])}`.trimEnd())
    }
  }
  return lines.filter(Boolean).join('\n')
}

export function renderSliderInspect(data: PatternData) {
  const key = data.relations?.rootKeys?.[0]
  if (!key) return ''
  return [
    'slider',
    attrLine({
      'aria-label': data.items[key]?.label,
      'aria-valuenow': data.state?.valueByKey?.[key],
    }, ['aria-label', 'aria-valuenow']),
  ].filter(Boolean).join('\n')
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

export function renderMenuInspect(
  data: PatternData,
  flavor: 'menubar' | 'menu-button',
  focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant' = 'rovingTabIndex',
) {
  if (flavor === 'menubar') {
    const activeKey = data.state?.activeKey
    const expandedKeys = data.state?.expandedKeys ?? []
    const lines = ['menubar', attrLine({ 'aria-label': data.refs?.label, 'aria-orientation': 'horizontal' }, ['aria-label', 'aria-orientation'])]
    ;(data.relations?.rootKeys ?? []).forEach((key) => {
      const label = data.items[key]?.label ?? key
      const marker = key === activeKey ? '>' : ' '
      const hasPopup = (data.relations?.childrenByKey?.[key]?.length ?? 0) > 0
      const expanded = expandedKeys.includes(key)
      const disabled = data.state?.disabledKeys?.includes(key) || undefined
      lines.push(`${marker} menuitem "${label}" ${attrLine({
        tabIndex: key === activeKey ? 0 : -1,
        'aria-haspopup': hasPopup ? 'menu' : undefined,
        'aria-expanded': hasPopup ? expanded : undefined,
        'aria-disabled': disabled,
      }, ['tabIndex', 'aria-haspopup', 'aria-expanded', 'aria-disabled'])}`.trimEnd())
      if (hasPopup && expanded) {
        ;(data.relations?.childrenByKey?.[key] ?? []).forEach((childKey) => {
          const item = data.items[childKey] as { label?: string; kind?: string } | undefined
          const role = item?.kind === 'menuitemcheckbox' ? 'menuitemcheckbox' : item?.kind === 'menuitemradio' ? 'menuitemradio' : 'menuitem'
          const checked = (role === 'menuitemcheckbox' || role === 'menuitemradio') ? Boolean(data.state?.checkedByKey?.[childKey]) : undefined
          const childDisabled = data.state?.disabledKeys?.includes(childKey) || undefined
          lines.push(`    ${role} "${item?.label ?? childKey}" ${attrLine({
            'aria-checked': checked,
            'aria-disabled': childDisabled,
          }, ['aria-checked', 'aria-disabled'])}`.trimEnd())
        })
      }
    })
    return lines.filter(Boolean).join('\n')
  }
  // menu-button
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
  if (expanded && menuKey) {
    lines.push(`  menu ${attrLine({
      'aria-labelledby': triggerKey,
      'aria-activedescendant': focusStrategy === 'ariaActiveDescendant' && activeKey ? `mb-${activeKey}` : undefined,
    }, ['aria-labelledby', 'aria-activedescendant'])}`.trimEnd())
    ;(data.relations?.childrenByKey?.[menuKey] ?? []).forEach((key) => {
      const marker = key === activeKey ? '>' : ' '
      const disabled = data.state?.disabledKeys?.includes(key) || undefined
      lines.push(`  ${marker} menuitem "${data.items[key]?.label ?? key}" ${attrLine({
        tabIndex: focusStrategy === 'rovingTabIndex' ? (key === activeKey ? 0 : -1) : undefined,
        'aria-disabled': disabled,
      }, ['tabIndex', 'aria-disabled'])}`.trimEnd())
    })
  }
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
