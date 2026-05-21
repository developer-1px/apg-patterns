import { z } from 'zod'
import { PatternItemSchema, PatternOptionsSchema, PatternStateSchema, type PatternData } from '../../schema'

export const SliderItemSchema = PatternItemSchema.safeExtend({
  valuemin: z.number().optional(),
  valuemax: z.number().optional(),
  valuetext: z.string().optional(),
})

export const SliderOptionsSchema = PatternOptionsSchema.safeExtend({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
})

export const SliderStateSchema = PatternStateSchema.safeExtend({
  options: SliderOptionsSchema.optional(),
})

type SliderItem = z.infer<typeof SliderItemSchema>
type SliderState = z.infer<typeof SliderStateSchema>

export type SliderData = PatternData<SliderItem, SliderState>
export type SliderOptions = z.infer<typeof SliderOptionsSchema>
