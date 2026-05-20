import type { PatternData, PatternEvent } from '../../../../src/react'

export interface MenuProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}
