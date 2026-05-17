import { useReducer } from 'react'
import { z } from 'zod'
import { PatternDataSchema, type PatternData, type PatternEvent } from '../../src'

export const DemoPatternHostStateSchema = z
  .object({
    variant: z.string().optional(),
    data: PatternDataSchema,
  })
  .strict()

export type DemoPatternHostState = z.infer<typeof DemoPatternHostStateSchema>

type HostAction =
  | { type: 'event'; event: PatternEvent }
  | { type: 'reset'; data: PatternData }

export function usePatternDataHost(
  initialData: PatternData,
  reduce: (data: PatternData, event: PatternEvent) => PatternData,
) {
  const [state, dispatch] = useReducer((current: DemoPatternHostState, action: HostAction): DemoPatternHostState => {
    if (action.type === 'reset') return DemoPatternHostStateSchema.parse({ data: action.data })
    return DemoPatternHostStateSchema.parse({ ...current, data: reduce(current.data, action.event) })
  }, DemoPatternHostStateSchema.parse({ data: initialData }))

  return {
    data: state.data,
    dispatchEvent: (event: PatternEvent) => dispatch({ type: 'event', event }),
    reset: () => dispatch({ type: 'reset', data: initialData }),
  }
}
