import type { Key, PatternData, PatternItem, PatternOptions, PatternState } from '../../schema'
import { comboboxRootKey } from './definition'

export type ComboboxVariant =
  | 'selectOnly'
  | 'listNoAutocomplete'
  | 'listAutocomplete'
  | 'listWithInlineAutocomplete'
  | 'datepicker'
  | 'gridPopup'

interface ComboboxState extends PatternState {
  variant?: ComboboxVariant
  query?: string
  inlineCompletion?: { start: number; end: number } | null
}

export type ComboboxData = PatternData<PatternItem, ComboboxState>

export interface ComboboxRuntimeState {
  runtimeOptions: PatternOptions
  variant: ComboboxVariant
  editable: boolean
  listboxId: string
  query: string
  inlineCompletion: { start: number; end: number } | null
  open: boolean
  displayValue: string
  activeKey: Key | null | undefined
  label: string
}

export function getComboboxRuntimeState(data: ComboboxData, options?: PatternOptions): ComboboxRuntimeState {
  const variant = data.state?.variant ?? 'listAutocomplete'
  const autocomplete = variant === 'listAutocomplete' || variant === 'gridPopup' ? 'list' : variant === 'listWithInlineAutocomplete' ? 'both' : 'none'
  const editable = variant !== 'selectOnly'
  const listboxId = options?.listboxId ? String(options.listboxId) : 'combobox-popup'
  const query = data.state?.query ?? ''
  const inlineCompletion = data.state?.inlineCompletion ?? null
  const open = data.state?.expandedKeys?.includes(comboboxRootKey) ?? false
  const selectedKey = data.state?.selectedKeys?.[0]
  const selectedLabel = selectedKey ? data.items[selectedKey]?.label ?? '' : ''
  const displayValue = editable ? (selectedKey && !open ? selectedLabel : query) : selectedLabel
  const label = typeof data.refs?.label === 'string' ? data.refs.label : data.items[comboboxRootKey]?.label ?? 'Option'

  return {
    runtimeOptions: { focusStrategy: 'ariaActiveDescendant', haspopup: 'listbox', autocomplete, ...(options ?? {}) },
    variant,
    editable,
    listboxId,
    query,
    inlineCompletion,
    open,
    displayValue,
    activeKey: data.state?.activeKey,
    label,
  }
}
