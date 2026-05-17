import { COMBOBOX_KEY, PatternDataSchema, type PatternData, type PatternEvent } from '../../src'

export type ComboboxVariantKey = 'selectOnly' | 'autocompleteList' | 'autocompleteBoth'

export const comboboxVariants: Record<ComboboxVariantKey, { label: string; autocomplete: 'none' | 'list' | 'both'; editable: boolean }> = {
  selectOnly: { label: 'Select-Only', autocomplete: 'none', editable: false },
  autocompleteList: { label: 'Autocomplete (List)', autocomplete: 'list', editable: true },
  autocompleteBoth: { label: 'Autocomplete (List + Inline)', autocomplete: 'both', editable: true },
}

export const FRUITS = [
  { key: 'apple', label: 'Apple' },
  { key: 'apricot', label: 'Apricot' },
  { key: 'banana', label: 'Banana' },
  { key: 'blackberry', label: 'Blackberry' },
  { key: 'cherry', label: 'Cherry' },
  { key: 'clementine', label: 'Clementine' },
  { key: 'grape', label: 'Grape' },
  { key: 'mango', label: 'Mango' },
  { key: 'orange', label: 'Orange' },
  { key: 'peach', label: 'Peach' },
  { key: 'pear', label: 'Pear' },
  { key: 'strawberry', label: 'Strawberry' },
] as const

export function buildComboboxData(visibleKeys: readonly string[] = FRUITS.map((f) => f.key)): PatternData {
  const items: PatternData['items'] = { [COMBOBOX_KEY]: { label: 'Fruit' } }
  for (const f of FRUITS) items[f.key] = { label: f.label }
  // Only the keys that pass the current filter are exposed as options (visible in popup).
  // We keep all items in the registry so reducers can still resolve labels, but the
  // pattern's `comboboxOptions` visibleOrder iterates Object.keys(items) excluding
  // the synthetic combobox key — so we trim items to the visible subset.
  const filteredItems: PatternData['items'] = { [COMBOBOX_KEY]: { label: 'Fruit' } }
  for (const k of visibleKeys) if (items[k]) filteredItems[k] = items[k]
  return PatternDataSchema.parse({
    items: filteredItems,
    state: { activeKey: null, expandedKeys: [], selectedKeys: [] },
    refs: { label: 'Fruit' },
  })
}

export const initialComboboxData: PatternData = buildComboboxData()

export function reduceComboboxData(current: PatternData, event: PatternEvent): PatternData {
  // Use the kernel's pattern reducer for navigate/select/expand events, but keep
  // a thin local override for navigate so we can move activeKey through the
  // current visible list (the kernel reducer expects relations.rootKeys).
  if (event.type === 'navigate') {
    const visible = Object.keys(current.items).filter((k) => k !== COMBOBOX_KEY)
    if (visible.length === 0) return current
    const active = current.state?.activeKey ?? null
    const idx = active && active !== COMBOBOX_KEY ? visible.indexOf(active) : -1
    let nextIdx = idx
    if (event.direction === 'first') nextIdx = 0
    else if (event.direction === 'last') nextIdx = visible.length - 1
    else if (event.direction === 'next') nextIdx = Math.min(idx + 1, visible.length - 1)
    else if (event.direction === 'previous') nextIdx = idx <= 0 ? 0 : idx - 1
    return { ...current, state: { ...current.state, activeKey: visible[nextIdx] ?? null } }
  }
  if (event.type === 'expand' && event.key === COMBOBOX_KEY) {
    const expandedKeys = event.expanded ? [COMBOBOX_KEY] : []
    return { ...current, state: { ...current.state, expandedKeys } }
  }
  if (event.type === 'select') {
    return { ...current, state: { ...current.state, selectedKeys: [...event.keys] } }
  }
  if (event.type === 'focus') {
    return { ...current, state: { ...current.state, activeKey: event.key } }
  }
  return current
}

export function filterFruits(query: string): readonly string[] {
  const q = query.trim().toLowerCase()
  if (!q) return FRUITS.map((f) => f.key)
  return FRUITS.filter((f) => f.label.toLowerCase().includes(q)).map((f) => f.key)
}

export function firstMatch(query: string): string | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const f = FRUITS.find((f) => f.label.toLowerCase().startsWith(q))
  return f?.key ?? null
}
