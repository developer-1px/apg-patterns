import { useState } from 'react'
import { listboxDefinition, reducePatternData, type PatternData, type PatternEvent, type PatternOptions } from '../../src'
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
  const [data, setData] = useState<PatternData>(initialByVariant[variant])
  const options: PatternOptions = variant === 'rearrangeableMulti'
    ? { focusStrategy: 'rovingTabIndex', selectionMode: 'multiple' }
    : { focusStrategy: 'rovingTabIndex', selectionMode: 'single' }
  const handleEvent = (event: PatternEvent) => setData((current) => reducePatternData(listboxDefinition, current, event))
  if (variant === 'scrollable') return <Listbox data={data} options={options} scrollable onEvent={handleEvent} />
  if (variant === 'grouped') return <Listbox data={data} options={options} groups={groupedListboxStructure} onEvent={handleEvent} />
  if (variant === 'rearrangeable' || variant === 'rearrangeableMulti') {
    return <RearrangeableListbox data={data} options={options} onChange={setData} onEvent={handleEvent} />
  }
  return <Listbox data={data} options={options} onEvent={handleEvent} />
}
