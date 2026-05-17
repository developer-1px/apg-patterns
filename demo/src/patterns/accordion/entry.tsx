import { usePatternDataHost } from '../../shared/demoHostState'
import { Accordion } from './Accordion'
import { initialAccordionData, reduceAccordionData } from './accordionData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'accordion',
  label: 'Accordion',
  order: 11,
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialAccordionData, reduceAccordionData)
    return {
      key: 'accordion',
      label: 'Accordion',
      keyboardShortcuts: ['Enter', 'Space', 'ArrowDown', 'ArrowUp', 'Home', 'End'],
      sourceNames: ['Accordion.tsx', 'accordionData.ts', 'accordion/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      preview: <Accordion data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}
