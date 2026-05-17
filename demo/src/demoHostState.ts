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
  | { type: 'selectVariant'; variant: string; data: PatternData }
  | { type: 'replaceData'; data: PatternData }

export function usePatternDataHost(
  initialData: PatternData,
  reduce: (data: PatternData, event: PatternEvent) => PatternData,
) {
  const [state, dispatch] = useReducer((current: DemoPatternHostState, action: HostAction): DemoPatternHostState => {
    if (action.type === 'reset') return DemoPatternHostStateSchema.parse({ data: action.data })
    if (action.type === 'selectVariant') return DemoPatternHostStateSchema.parse({ variant: action.variant, data: action.data })
    if (action.type === 'replaceData') return DemoPatternHostStateSchema.parse({ ...current, data: action.data })
    return DemoPatternHostStateSchema.parse({ ...current, data: reduce(current.data, action.event) })
  }, DemoPatternHostStateSchema.parse({ data: initialData }))

  return {
    data: state.data,
    dispatchEvent: (event: PatternEvent) => dispatch({ type: 'event', event }),
    replaceData: (data: PatternData) => dispatch({ type: 'replaceData', data }),
    reset: () => dispatch({ type: 'reset', data: initialData }),
  }
}

export function useVariantPatternDataHost<Variant extends string>(
  initialVariant: Variant,
  initialData: PatternData,
  dataByVariant: (variant: Variant) => PatternData,
  reduce: (variant: Variant, data: PatternData, event: PatternEvent) => PatternData,
) {
  const [state, dispatch] = useReducer((current: DemoPatternHostState, action: HostAction): DemoPatternHostState => {
    if (action.type === 'reset') return DemoPatternHostStateSchema.parse({ ...current, data: action.data })
    if (action.type === 'selectVariant') return DemoPatternHostStateSchema.parse({ variant: action.variant, data: action.data })
    if (action.type === 'replaceData') return DemoPatternHostStateSchema.parse({ ...current, data: action.data })
    return DemoPatternHostStateSchema.parse({
      ...current,
      data: reduce(current.variant as Variant, current.data, action.event),
    })
  }, DemoPatternHostStateSchema.parse({ variant: initialVariant, data: initialData }))

  const variant = state.variant as Variant

  return {
    variant,
    data: state.data,
    dispatchEvent: (event: PatternEvent) => dispatch({ type: 'event', event }),
    replaceData: (data: PatternData) => dispatch({ type: 'replaceData', data }),
    selectVariant: (next: Variant) => dispatch({ type: 'selectVariant', variant: next, data: dataByVariant(next) }),
    reset: () => dispatch({ type: 'reset', data: dataByVariant(variant) }),
  }
}
