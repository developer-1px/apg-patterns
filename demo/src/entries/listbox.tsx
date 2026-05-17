import { useState } from 'react'
import { listboxDefinition, reducePatternData, type PatternData, type PatternEvent, type PatternOptions } from '../../../src'
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

export const entry: PatternEntry = {
  key: 'listbox',
  label: 'Listbox',
  order: 2,
  useDemoPattern: (onEvent) => {
    const initialByVariant: Record<ListboxVariantKey, PatternData> = {
      basic: initialListboxData,
      scrollable: initialScrollableListboxData,
      grouped: initialGroupedListboxData,
      rearrangeable: initialRearrangeableListboxData,
      rearrangeableMulti: initialRearrangeableListboxData,
    }
    const [variant, setVariant] = useState<ListboxVariantKey>('basic')
    const [data, setData] = useState<PatternData>(initialListboxData)
    const options: PatternOptions = variant === 'rearrangeableMulti'
      ? { focusStrategy: 'rovingTabIndex', selectionMode: 'multiple' }
      : { focusStrategy: 'rovingTabIndex', selectionMode: 'single' }
    const handleEvent = (event: PatternEvent) => {
      onEvent(event)
      setData((current) => reducePatternData(listboxDefinition, current, event))
    }
    const preview = variant === 'scrollable'
      ? <Listbox data={data} options={options} scrollable onEvent={handleEvent} />
      : variant === 'grouped'
        ? <Listbox data={data} options={options} groups={groupedListboxStructure} onEvent={handleEvent} />
        : variant === 'rearrangeable' || variant === 'rearrangeableMulti'
          ? <RearrangeableListbox data={data} options={options} onChange={setData} onEvent={handleEvent} />
          : <Listbox data={data} options={options} onEvent={handleEvent} />

    return {
      key: 'listbox',
      label: 'Listbox',
      keyboardShortcuts: ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space'],
      sourceNames: ['Listbox.tsx', 'RearrangeableListbox.tsx', 'listboxData.ts', 'listbox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderListboxInspect(data),
      variants: <VariantListbox value={variant} items={listboxVariantItems} label="listbox variants" idPrefix="listbox-variant" onChange={(next) => {
        setVariant(next)
        setData(initialByVariant[next])
      }} />,
      preview,
      reset: () => setData(initialByVariant[variant]),
    }
  },
}
