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

const initialByVariant: Record<ListboxTestVariant, PatternData> = {
  basic: initialListboxData,
  scrollable: initialScrollableListboxData,
  grouped: initialGroupedListboxData,
  rearrangeable: initialRearrangeableListboxData,
  rearrangeableMulti: initialRearrangeableListboxData,
}

export function ListboxDemo({ variant = 'basic' }: { variant?: ListboxTestVariant }) {
  const host = usePatternDataHost(initialByVariant[variant], (data, event) => reducePatternData(listboxDefinition, data, event))
  const options: PatternOptions = variant === 'rearrangeableMulti'
    ? { focusStrategy: 'rovingTabIndex', selectionMode: 'multiple' }
    : { focusStrategy: 'rovingTabIndex', selectionMode: 'single' }
  const handleEvent = (event: PatternEvent) => host.dispatchEvent(event)
  if (variant === 'scrollable') return <Listbox data={host.data} options={options} scrollable onEvent={handleEvent} />
  if (variant === 'grouped') return <Listbox data={host.data} options={options} groups={groupedListboxStructure} onEvent={handleEvent} />
  if (variant === 'rearrangeable' || variant === 'rearrangeableMulti') {
    return <RearrangeableListbox data={host.data} options={options} onChange={host.replaceData} onEvent={handleEvent} />
  }
  return <Listbox data={host.data} options={options} onEvent={handleEvent} />
}
