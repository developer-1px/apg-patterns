import { usePatternDataHost } from '../../shared/demoHostState'
import { renderDataInspect } from '../../shared/inspect/index'
import { RadioGroup } from './RadioGroup'
import { initialRadioData, reduceRadioData } from './radioData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'

export const entry: PatternEntry = {
  key: 'radio',
  label: 'Radio Group',
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialRadioData, reduceRadioData)
    return {
      key: 'radio',
      label: 'Radio Group',
      keyboardShortcuts: ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End', 'Space'],
      sourceNames: ['RadioGroup.tsx', 'radioData.ts', 'radio/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      preview: <RadioGroup data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
    }
  },
}
