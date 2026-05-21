import { listboxDefinition, reducePatternData, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src/react'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { variantItemsFrom } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'
import { Listbox } from './Listbox'
import {
  groupedListboxStructure,
  initialGroupedListboxData,
  initialListboxData,
  initialRearrangeableListboxData,
  initialScrollableListboxData,
} from './listboxData'
import { RearrangeableListbox } from './RearrangeableListbox'

type ListboxVariantKey = 'basic' | 'collapsible' | 'scrollable' | 'grouped' | 'rearrangeable' | 'rearrangeableMulti'

const listboxVariants: Record<ListboxVariantKey, { label: string; data: PatternData }> = {
  basic: { label: 'Basic', data: initialListboxData },
  collapsible: { label: 'Collapsible', data: initialListboxData },
  scrollable: { label: 'Scrollable', data: initialScrollableListboxData },
  grouped: { label: 'Grouped', data: initialGroupedListboxData },
  rearrangeable: { label: 'Rearrangeable (single-select)', data: initialRearrangeableListboxData },
  rearrangeableMulti: { label: 'Rearrangeable (multi-select)', data: initialRearrangeableListboxData },
}

export const listboxVariantItems = variantItemsFrom(listboxVariants)

export function useListboxDemoRuntime(onEvent: (event: PatternEvent) => void) {
  const host = useVariantPatternDataHost<ListboxVariantKey>(
    'basic',
    initialListboxData,
    (variant) => listboxVariants[variant].data,
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
