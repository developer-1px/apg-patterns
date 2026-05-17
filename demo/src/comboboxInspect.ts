import type { PatternData } from '../../src'
import { attrLine } from './inspectUtils'

export function renderComboboxInspect(
  data: PatternData,
  comboboxOptions: { autocomplete: 'none' | 'list' | 'both' },
) {
  const comboboxKey = 'combobox'
  const expanded = data.state?.expandedKeys?.includes(comboboxKey) ?? false
  const activeKey = data.state?.activeKey
  const lines = [
    'combobox',
    attrLine(
      {
        role: 'combobox',
        'aria-expanded': expanded,
        'aria-haspopup': 'listbox',
        'aria-autocomplete': comboboxOptions.autocomplete,
        'aria-controls': 'combobox-popup',
        'aria-activedescendant': activeKey ? `combobox-option-${activeKey}` : undefined,
        'aria-label': data.refs?.label,
      },
      ['role', 'aria-expanded', 'aria-haspopup', 'aria-autocomplete', 'aria-controls', 'aria-activedescendant', 'aria-label'],
    ),
  ]
  if (!expanded) return lines.filter(Boolean).join('\n')
  lines.push('listbox id="combobox-popup"')
  for (const key of Object.keys(data.items).filter((itemKey) => itemKey !== comboboxKey)) {
    const marker = key === activeKey ? '>' : ' '
    lines.push(`${marker} option "${data.items[key]?.label ?? key}" ${attrLine({ id: `combobox-option-${key}`, 'aria-selected': data.state?.selectedKeys?.includes(key) || undefined }, ['id', 'aria-selected'])}`.trimEnd())
  }
  return lines.filter(Boolean).join('\n')
}
