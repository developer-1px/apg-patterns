import {
  menubarDefinition,
  menuButtonDefinition,
  reducePatternData,
  type PatternEvent,
} from '../../../../../src/react'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Menu } from '../Menu'
import { menuVariants } from '../menuData'

export function MenuDemo({ variant, onEvent }: { variant: keyof typeof menuVariants; onEvent?: (event: PatternEvent) => void }) {
  const v = menuVariants[variant]
  const definition = v.apgPattern === 'menubar' ? menubarDefinition : menuButtonDefinition
  const host = usePatternDataHost({
    ...v.data,
    state: { ...v.data.state, apgPattern: v.apgPattern, focusStrategy: v.focusStrategy },
  }, (data, event) => {
    const next = reducePatternData(definition, data, event)
    return { ...next, state: { ...next.state, apgPattern: v.apgPattern, focusStrategy: v.focusStrategy } }
  })
  return (
    <Menu
      data={host.data}
      onEvent={(event) => {
        onEvent?.(event)
        host.dispatchEvent(event)
      }}
    />
  )
}
