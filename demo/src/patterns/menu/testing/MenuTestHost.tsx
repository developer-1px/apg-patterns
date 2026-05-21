import { useState } from 'react'
import {
  menubarDefinition,
  menuButtonDefinition,
  reducePatternData,
  type PatternData,
  type PatternEvent,
} from '../../../../../src/react'
import { Menu } from '../Menu'
import { menuVariants } from '../menuData'

export function MenuDemo({ variant, onEvent }: { variant: keyof typeof menuVariants; onEvent?: (event: PatternEvent) => void }) {
  const v = menuVariants[variant]
  const definition = v.apgPattern === 'menubar' ? menubarDefinition : menuButtonDefinition
  const [data, setData] = useState<PatternData>({
    ...v.data,
    state: { ...v.data.state, apgPattern: v.apgPattern, focusStrategy: v.focusStrategy },
  })
  return (
    <Menu
      data={data}
      onEvent={(event) => {
        onEvent?.(event)
        setData((current) => {
          const next = reducePatternData(definition, current, event)
          return { ...next, state: { ...next.state, apgPattern: v.apgPattern, focusStrategy: v.focusStrategy } }
        })
      }}
    />
  )
}
