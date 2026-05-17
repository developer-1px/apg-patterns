import { listboxDefinition, reducePatternData, type PatternData, type PatternEvent, type PatternOptions } from '../../src'
import { usePatternDataHost } from './demoHostState'
import { Listbox } from './Listbox'
import {
  groupedListboxStructure,
  initialGroupedListboxData,
  initialListboxData,
  initialRearrangeableListboxData,
  initialScrollableListboxData,
} from './listboxData'
import { RearrangeableListbox } from './RearrangeableListbox'

export type ListboxTestVariant = 'basic' | 'scrollable' | 'grouped' | 'rearrangeable' | 'rearrangeableMulti'

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
    : { focusStrategy: 'rovingTabIndex', selectionMode: 'single' }
  const state = {
    ...host.data.state,
    options,
    scrollable: variant === 'scrollable',
  }
  const data: PatternData = {
    ...host.data,
    state: variant === 'grouped' ? { ...state, groups: groupedListboxStructure } : state,
  }
  const handleEvent = (event: PatternEvent) => host.dispatchEvent(event)
  if (variant === 'rearrangeable' || variant === 'rearrangeableMulti') {
    return <RearrangeableListbox data={data} onEvent={handleEvent} />
  }
  return <Listbox data={data} onEvent={handleEvent} />
}
