import { listboxDefinition, reducePatternData, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src/react'
import { variantItemsFrom } from '../../shared/demoPatternTypes'
import { Listbox } from './Listbox'
import {
  groupedListboxStructure,
  initialGroupedListboxData,
  initialListboxData,
  initialRearrangeableListboxData,
  initialScrollableListboxData,
} from './listboxData'
import { RearrangeableListbox } from './RearrangeableListbox'

export type ListboxVariantKey = 'basic' | 'collapsible' | 'scrollable' | 'grouped' | 'rearrangeable' | 'rearrangeableMulti'

export const listboxVariants: Record<ListboxVariantKey, { label: string; data: PatternData }> = {
  basic: { label: 'Basic', data: initialListboxData },
  collapsible: { label: 'Collapsible', data: initialListboxData },
  scrollable: { label: 'Scrollable', data: initialScrollableListboxData },
  grouped: { label: 'Grouped', data: initialGroupedListboxData },
  rearrangeable: { label: 'Rearrangeable (single-select)', data: initialRearrangeableListboxData },
  rearrangeableMulti: { label: 'Rearrangeable (multi-select)', data: initialRearrangeableListboxData },
}

export const listboxVariantItems = variantItemsFrom(listboxVariants)

export function listboxDemoOptions(variant: ListboxVariantKey): PatternOptions {
  return variant === 'rearrangeableMulti'
    ? { focusStrategy: 'rovingTabIndex', selectionMode: 'multiple' }
    : { focusStrategy: 'rovingTabIndex', selectionMode: 'single', followFocus: variant === 'scrollable' }
}

export function listboxPreviewData(variant: ListboxVariantKey, data: PatternData): PatternData {
  const state = {
    ...data.state,
    scrollable: variant === 'scrollable',
  }
  return {
    ...data,
    state: variant === 'grouped' ? { ...state, groups: groupedListboxStructure } : state,
  }
}

export function isRearrangeableListboxVariant(variant: ListboxVariantKey): boolean {
  return variant === 'rearrangeable' || variant === 'rearrangeableMulti'
}

export function reduceListboxDemoData(data: PatternData, event: PatternEvent): PatternData {
  if (event.type === 'reorder') {
    return { ...data, relations: { ...data.relations, rootKeys: [...event.keys] } }
  }
  if (event.type === 'remove') {
    return { ...data, relations: { ...data.relations, rootKeys: [...(event.keys ?? data.relations?.rootKeys ?? [])] }, state: { ...data.state, activeKey: event.activeKey, selectedKeys: [...(event.selectedKeys ?? [])] } }
  }
  return reducePatternData(listboxDefinition, data, event)
}

export function ListboxPreview({
  variant,
  data,
  onEvent,
  options,
}: {
  variant: ListboxVariantKey
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options: PatternOptions
}) {
  return isRearrangeableListboxVariant(variant)
    ? <RearrangeableListbox data={data} onEvent={onEvent} options={options} />
    : <Listbox data={data} onEvent={onEvent} options={options} />
}
