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

export const entry: PatternEntry = {
  key: 'listbox',
  label: 'Listbox',
  order: 2,
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<ListboxVariantKey>(
      'basic',
      initialListboxData,
      (variant) => initialByVariant[variant],
      (_variant, data, event) => reducePatternData(listboxDefinition, data, event),
    )
    const options: PatternOptions = host.variant === 'rearrangeableMulti'
      ? { focusStrategy: 'rovingTabIndex', selectionMode: 'multiple' }
      : { focusStrategy: 'rovingTabIndex', selectionMode: 'single' }
    const handleEvent = (event: PatternEvent) => {
      onEvent(event)
      host.dispatchEvent(event)
    }
    const preview = host.variant === 'scrollable'
      ? <Listbox data={host.data} options={options} scrollable onEvent={handleEvent} />
      : host.variant === 'grouped'
        ? <Listbox data={host.data} options={options} groups={groupedListboxStructure} onEvent={handleEvent} />
        : host.variant === 'rearrangeable' || host.variant === 'rearrangeableMulti'
          ? <RearrangeableListbox data={host.data} options={options} onChange={host.replaceData} onEvent={handleEvent} />
          : <Listbox data={host.data} options={options} onEvent={handleEvent} />

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
