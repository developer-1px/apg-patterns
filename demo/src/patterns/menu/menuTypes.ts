import type { PatternData, PatternEvent } from '../../../../src'

export interface MenuProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}
