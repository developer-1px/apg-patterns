import { listboxDefinition, reducePatternData, type PatternData, type PatternEvent, type PatternOptions } from '../../../src'
import { useVariantPatternDataHost } from '../demoHostState'
import { renderListboxInspect } from '../inspect'
import { Listbox } from '../Listbox'
import {
  groupedListboxStructure,
  initialGroupedListboxData,
  initialListboxData,
  initialRearrangeableListboxData,
  initialScrollableListboxData,
} from '../listboxData'
import { RearrangeableListbox } from '../RearrangeableListbox'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'

type ListboxVariantKey = 'basic' | 'scrollable' | 'grouped' | 'rearrangeable' | 'rearrangeableMulti'

const listboxVariantItems: readonly { key: ListboxVariantKey; label: string }[] = [
  { key: 'basic', label: 'Basic' },
  { key: 'scrollable', label: 'Scrollable' },
  { key: 'grouped', label: 'Grouped' },
  { key: 'rearrangeable', label: 'Rearrangeable (single-select)' },
  { key: 'rearrangeableMulti', label: 'Rearrangeable (multi-select)' },
]

const initialByVariant: Record<ListboxVariantKey, PatternData> = {
  basic: initialListboxData,
  scrollable: initialScrollableListboxData,
  grouped: initialGroupedListboxData,
  rearrangeable: initialRearrangeableListboxData,
  rearrangeableMulti: initialRearrangeableListboxData,
}

const reduceListboxDemoData = (data: PatternData, event: PatternEvent): PatternData => {
  if (event.type === 'extension' && event.name === 'listboxMove') {
    const rootKeys = Array.isArray(event.payload?.rootKeys) ? event.payload.rootKeys.filter((key): key is string => typeof key === 'string') : data.relations?.rootKeys ?? []
    return { ...data, relations: { ...data.relations, rootKeys } }
  }
  if (event.type === 'extension' && event.name === 'listboxRemove') {
    const rootKeys = Array.isArray(event.payload?.rootKeys) ? event.payload.rootKeys.filter((key): key is string => typeof key === 'string') : data.relations?.rootKeys ?? []
    const selectedKeys = Array.isArray(event.payload?.selectedKeys) ? event.payload.selectedKeys.filter((key): key is string => typeof key === 'string') : []
    const activeKey = typeof event.payload?.activeKey === 'string' ? event.payload.activeKey : null
    return { ...data, relations: { ...data.relations, rootKeys }, state: { ...data.state, activeKey, selectedKeys } }
  }
  return reducePatternData(listboxDefinition, data, event)
}

export const entry: PatternEntry = {
  key: 'listbox',
  label: 'Listbox',
  order: 2,
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<ListboxVariantKey>(
      'basic',
      initialListboxData,
      (variant) => initialByVariant[variant],
      (_variant, data, event) => reduceListboxDemoData(data, event),
    )
    const options: PatternOptions = host.variant === 'rearrangeableMulti'
      ? { focusStrategy: 'rovingTabIndex', selectionMode: 'multiple' }
      : { focusStrategy: 'rovingTabIndex', selectionMode: 'single' }
    const handleEvent = (event: PatternEvent) => {
      onEvent(event)
      host.dispatchEvent(event)
    }
    const state = {
      ...host.data.state,
      options,
      scrollable: host.variant === 'scrollable',
    }
    const data: PatternData = {
      ...host.data,
      state: host.variant === 'grouped' ? { ...state, groups: groupedListboxStructure } : state,
    }
    const preview = host.variant === 'rearrangeable' || host.variant === 'rearrangeableMulti'
      ? <RearrangeableListbox data={data} onEvent={handleEvent} />
      : <Listbox data={data} onEvent={handleEvent} />

    return {
      key: 'listbox',
      label: 'Listbox',
      keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space'],
      sourceNames: ['Listbox.tsx', 'RearrangeableListbox.tsx', 'listboxData.ts', 'listbox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderListboxInspect(host.data),
      variants: <VariantListbox value={host.variant} items={listboxVariantItems} label="listbox variants" idPrefix="listbox-variant" onChange={host.selectVariant} />,
      preview,
      reset: host.reset,
    }
  },
}
