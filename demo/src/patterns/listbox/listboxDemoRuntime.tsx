import { listboxDefinition, reducePatternData, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { renderDataInspect } from '../../shared/inspect/index'
import { Listbox } from './Listbox'
import {
  groupedListboxStructure,
  initialGroupedListboxData,
  initialListboxData,
  initialRearrangeableListboxData,
  initialScrollableListboxData,
} from './listboxData'
import { RearrangeableListbox } from './RearrangeableListbox'

export type ListboxVariantKey = 'basic' | 'scrollable' | 'grouped' | 'rearrangeable' | 'rearrangeableMulti'

export const listboxVariantItems: readonly { key: ListboxVariantKey; label: string }[] = [
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

export function useListboxDemoRuntime(onEvent: (event: PatternEvent) => void) {
  const host = useVariantPatternDataHost<ListboxVariantKey>(
    'basic',
    initialListboxData,
    (variant) => initialByVariant[variant],
    (_variant, data, event) => reduceListboxDemoData(data, event),
  )
  const options: PatternOptions = host.variant === 'rearrangeableMulti'
    ? { focusStrategy: 'rovingTabIndex', selectionMode: 'multiple' }
    : { focusStrategy: 'rovingTabIndex', selectionMode: 'single', followFocus: host.variant === 'scrollable' }
  const handleEvent = (event: PatternEvent) => {
    onEvent(event)
    host.dispatchEvent(event)
  }
  const state = {
    ...host.data.state,
    scrollable: host.variant === 'scrollable',
  }
  const data: PatternData = {
    ...host.data,
    state: host.variant === 'grouped' ? { ...state, groups: groupedListboxStructure } : state,
  }

  return {
    inspect: renderDataInspect(host.data),
    context: {
      values: {
        state: { variant: host.variant, data, options },
        model: { variantItems: listboxVariantItems },
      },
      actions: {
        selectVariant: host.selectVariant,
        dispatchEvent: handleEvent,
      },
      components: { ListboxPreview },
    },
  }
}

function reduceListboxDemoData(data: PatternData, event: PatternEvent): PatternData {
  if (event.type === 'reorder') {
    return { ...data, relations: { ...data.relations, rootKeys: [...event.keys] } }
  }
  if (event.type === 'remove') {
    return { ...data, relations: { ...data.relations, rootKeys: [...(event.keys ?? data.relations?.rootKeys ?? [])] }, state: { ...data.state, activeKey: event.activeKey, selectedKeys: [...(event.selectedKeys ?? [])] } }
  }
  return reducePatternData(listboxDefinition, data, event)
}

function ListboxPreview({
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
  return variant === 'rearrangeable' || variant === 'rearrangeableMulti'
    ? <RearrangeableListbox data={data} onEvent={onEvent} options={options} />
    : <Listbox data={data} onEvent={onEvent} options={options} />
}
