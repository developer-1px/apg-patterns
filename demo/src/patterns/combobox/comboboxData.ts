import { PatternDataSchema, type PatternData, type PatternEvent } from '../../../../src/react'
import { variantItemsFrom } from '../../shared/demoPatternTypes'

const comboboxRootKey = 'combobox'

export type ComboboxVariantKey =
  | 'selectOnly'
  | 'listNoAutocomplete'
  | 'listAutocomplete'
  | 'listWithInlineAutocomplete'
  | 'datepicker'
  | 'gridPopup'

export const comboboxVariants: Record<ComboboxVariantKey, { label: string; autocomplete: 'none' | 'list' | 'both'; editable: boolean }> = {
  selectOnly: { label: 'Select-Only', autocomplete: 'none', editable: false },
  listNoAutocomplete: { label: 'Editable without Autocomplete', autocomplete: 'none', editable: true },
  listAutocomplete: { label: 'List Autocomplete', autocomplete: 'list', editable: true },
  listWithInlineAutocomplete: { label: 'List with Inline Autocomplete', autocomplete: 'both', editable: true },
  datepicker: { label: 'Date Picker Combobox', autocomplete: 'none', editable: true },
  gridPopup: { label: 'Grid Popup Combobox', autocomplete: 'list', editable: true },
}

export const comboboxVariantItems = variantItemsFrom(comboboxVariants)

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

export function buildComboboxData(
  visibleKeys: readonly string[] = FRUITS.map((f) => f.key),
  variant: ComboboxVariantKey = 'listAutocomplete',
): PatternData {
  const sourceItems = variant === 'datepicker' ? DATES : variant === 'gridPopup' ? PEOPLE : FRUITS
  const label = variant === 'datepicker' ? 'Date' : variant === 'gridPopup' ? 'Recipient' : 'Fruit'
  const keys = visibleKeys.length === FRUITS.length && sourceItems !== FRUITS ? sourceItems.map((item) => item.key) : visibleKeys
  const visible = new Set(keys)
  const filteredItems: PatternData['items'] = { [comboboxRootKey]: { label } }
  for (const item of sourceItems) if (visible.has(item.key)) filteredItems[item.key] = { label: item.label }
  return PatternDataSchema.parse({
    items: filteredItems,
    state: { activeKey: null, expandedKeys: [], selectedKeys: [], query: '', inlineCompletion: null, variant },
    refs: { label },
  })
}

export function reduceComboboxData(current: PatternData, event: PatternEvent): PatternData {
  if (event.type === 'navigate') {
    const visible = Object.keys(current.items).filter((k) => k !== comboboxRootKey)
    if (visible.length === 0) return current
    const active = current.state?.activeKey ?? null
    const idx = active && active !== comboboxRootKey ? visible.indexOf(active) : -1
    let nextIdx = idx
    if (event.direction === 'first') nextIdx = 0
    else if (event.direction === 'last') nextIdx = visible.length - 1
    else if (event.direction === 'next') nextIdx = Math.min(idx + 1, visible.length - 1)
    else if (event.direction === 'previous') nextIdx = idx <= 0 ? 0 : idx - 1
    return { ...current, state: { ...current.state, activeKey: visible[nextIdx] ?? null } }
  }
  if (event.type === 'expand' && event.key === comboboxRootKey) {
    const expandedKeys = event.expanded ? [comboboxRootKey] : []
    return { ...current, state: { ...current.state, expandedKeys } }
  }
  if (event.type === 'select') {
    return { ...current, state: { ...current.state, selectedKeys: [...event.keys] } }
  }
  if (event.type === 'focus') {
    return { ...current, state: { ...current.state, activeKey: event.key } }
  }
  if (event.type === 'inputValue') {
    const raw = event.value
    const inline = event.inline === true
    const variant = (current.state?.variant as ComboboxVariantKey | undefined) ?? 'listAutocomplete'
    const sourceItems = getComboboxSourceItems(variant)
    const filtered = filterComboboxItems(sourceItems, raw)
    const match = inline ? firstMatch(sourceItems, raw) : null
    const matchLabel = match ? sourceItems.find((item) => item.key === match)?.label ?? '' : ''
    const shouldComplete = inline && raw.length > 0 && match && matchLabel.toLowerCase().startsWith(raw.toLowerCase()) && matchLabel.length > raw.length
    const next = buildComboboxData(filtered, variant)
    return {
      ...next,
      state: {
        ...current.state,
        query: shouldComplete ? matchLabel : raw,
        inlineCompletion: shouldComplete ? { start: raw.length, end: matchLabel.length } : null,
        expandedKeys: [comboboxRootKey],
        activeKey: shouldComplete ? match : filtered[0] ?? null,
      },
    }
  }
  if (event.type === 'commitValue') {
    return {
      ...current,
      state: {
        ...current.state,
        query: event.value,
        inlineCompletion: null,
      },
    }
  }
  if (event.type === 'typeahead') {
    const nextQuery = `${(current.state as { query?: string } | undefined)?.query ?? ''}${event.query}`
    const variant = (current.state?.variant as ComboboxVariantKey | undefined) ?? 'listAutocomplete'
    const sourceItems = getComboboxSourceItems(variant)
    const match = firstMatch(sourceItems, nextQuery) ?? firstMatch(sourceItems, event.query)
    return {
      ...current,
      state: {
        ...current.state,
        query: nextQuery,
        activeKey: match ?? current.state?.activeKey ?? null,
      },
    }
  }
  return current
}

function firstMatch(sourceItems: readonly ComboboxItem[], query: string): string | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const item = sourceItems.find((item) => item.label.toLowerCase().startsWith(q))
  return item?.key ?? null
}

type ComboboxItem = { key: string; label: string }

function filterComboboxItems(sourceItems: readonly ComboboxItem[], query: string): readonly string[] {
  const q = query.trim().toLowerCase()
  if (!q) return sourceItems.map((item) => item.key)
  return sourceItems.filter((item) => item.label.toLowerCase().includes(q)).map((item) => item.key)
}

function getComboboxSourceItems(variant: ComboboxVariantKey): readonly ComboboxItem[] {
  if (variant === 'datepicker') return DATES
  if (variant === 'gridPopup') return PEOPLE
  return FRUITS
}

const DATES = [
  { key: 'date-2026-05-18', label: 'May 18, 2026' },
  { key: 'date-2026-05-19', label: 'May 19, 2026' },
  { key: 'date-2026-05-20', label: 'May 20, 2026' },
  { key: 'date-2026-05-21', label: 'May 21, 2026' },
] as const

const PEOPLE = [
  { key: 'person-ada', label: 'Ada Lovelace, Engineering' },
  { key: 'person-grace', label: 'Grace Hopper, Platform' },
  { key: 'person-katherine', label: 'Katherine Johnson, Research' },
  { key: 'person-dorothy', label: 'Dorothy Vaughan, Operations' },
] as const
