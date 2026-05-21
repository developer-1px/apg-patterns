import { z } from 'zod'
import { PatternItemSchema, PatternOptionsSchema, type PatternData } from '../../schema'

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

type SliderItem = z.infer<typeof SliderItemSchema>

export type SliderData = PatternData<SliderItem>
export type SliderOptions = z.infer<typeof SliderOptionsSchema>
