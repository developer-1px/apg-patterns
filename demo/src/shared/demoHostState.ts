import { useReducer } from 'react'
import { z } from 'zod'
import { PatternDataSchema, type PatternData, type PatternEvent } from '../../../src'

export const DemoPatternHostStateSchema = z
  .object({
    variant: z.string().optional(),
    data: PatternDataSchema,
  })
  .strict()

export type DemoPatternHostState = z.infer<typeof DemoPatternHostStateSchema>

type HostAction =
  | { type: 'event'; event: PatternEvent }
  | { type: 'selectVariant'; variant: string; data: PatternData }

type VariantHostAction<Variant extends string> =
  | { type: 'event'; event: PatternEvent }
  | { type: 'selectVariant'; variant: Variant; data: PatternData }

interface VariantHostState<Variant extends string> {
  variant: Variant
  data: PatternData
}

export function usePatternDataHost(
  initialData: PatternData,
  reduce: (data: PatternData, event: PatternEvent) => PatternData,
) {
  const [state, dispatch] = useReducer((current: DemoPatternHostState, action: HostAction): DemoPatternHostState => {
    if (action.type === 'selectVariant') return DemoPatternHostStateSchema.parse({ variant: action.variant, data: action.data })
    return DemoPatternHostStateSchema.parse({ ...current, data: reduce(current.data, action.event) })
  }, DemoPatternHostStateSchema.parse({ data: initialData }))

  return {
    data: state.data,
    dispatchEvent: (event: PatternEvent) => dispatch({ type: 'event', event }),
  }
}

export function useVariantPatternDataHost<Variant extends string>(
  initialVariant: Variant,
  initialData: PatternData,
  dataByVariant: (variant: Variant) => PatternData,
  reduce: (variant: Variant, data: PatternData, event: PatternEvent) => PatternData,
) {
  const [state, dispatch] = useReducer((current: VariantHostState<Variant>, action: VariantHostAction<Variant>): VariantHostState<Variant> => {
    if (action.type === 'selectVariant') return parseVariantHostState(action.variant, action.data)
    return parseVariantHostState(current.variant, reduce(current.variant, current.data, action.event))
  }, parseVariantHostState(initialVariant, initialData))

  return {
    variant: state.variant,
    data: state.data,
    dispatchEvent: (event: PatternEvent) => dispatch({ type: 'event', event }),
    selectVariant: (next: Variant) => dispatch({ type: 'selectVariant', variant: next, data: dataByVariant(next) }),
  }
}

function parseVariantHostState<Variant extends string>(variant: Variant, data: PatternData): VariantHostState<Variant> {
  PatternDataSchema.parse(data)
  return { variant, data }
}
