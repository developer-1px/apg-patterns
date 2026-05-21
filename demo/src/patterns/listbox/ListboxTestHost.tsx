import { listboxDefinition, reducePatternData, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src/react'
import { usePatternDataHost } from '../../shared/demoHostState'
import { Listbox } from './Listbox'
import {
  groupedListboxStructure,
  initialGroupedListboxData,
  initialListboxData,
  initialRearrangeableListboxData,
  initialScrollableListboxData,
} from './listboxData'
import { RearrangeableListbox } from './RearrangeableListbox'

type ListboxTestVariant = 'basic' | 'scrollable' | 'grouped' | 'rearrangeable' | 'rearrangeableMulti'

const reduceListboxDemoData = (data: PatternData, event: PatternEvent): PatternData => {
  if (event.type === 'reorder') {
    return { ...data, relations: { ...data.relations, rootKeys: [...event.keys] } }
  }
  if (event.type === 'remove') {
    return { ...data, relations: { ...data.relations, rootKeys: [...(event.keys ?? data.relations?.rootKeys ?? [])] }, state: { ...data.state, activeKey: event.activeKey, selectedKeys: [...(event.selectedKeys ?? [])] } }
  }
  return reducePatternData(listboxDefinition, data, event)
}

const initialByVariant: Record<ListboxTestVariant, PatternData> = {
  basic: initialListboxData,
  scrollable: initialScrollableListboxData,
  grouped: initialGroupedListboxData,
  rearrangeable: initialRearrangeableListboxData,
  rearrangeableMulti: initialRearrangeableListboxData,
}

export function ListboxDemo({ variant = 'basic' }: { variant?: ListboxTestVariant }) {
  const host = usePatternDataHost(initialByVariant[variant], reduceListboxDemoData)
  const options: PatternOptions = variant === 'rearrangeableMulti'
    ? { focusStrategy: 'rovingTabIndex', selectionMode: 'multiple' }
    : { focusStrategy: 'rovingTabIndex', selectionMode: 'single', followFocus: variant === 'scrollable' }
  const state = {
    ...host.data.state,
    scrollable: variant === 'scrollable',
  }
  const data: PatternData = {
    ...host.data,
    state: variant === 'grouped' ? { ...state, groups: groupedListboxStructure } : state,
  }
  const handleEvent = (event: PatternEvent) => host.dispatchEvent(event)
  if (variant === 'rearrangeable' || variant === 'rearrangeableMulti') {
    return <RearrangeableListbox data={data} onEvent={handleEvent} options={options} />
  }
  return <Listbox data={data} onEvent={handleEvent} options={options} />
}
