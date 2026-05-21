import { z } from 'zod'
import { PatternOptionsSchema } from '../../schema'

export const SliderOptionsSchema = PatternOptionsSchema.safeExtend({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
})

export type SliderOptions = z.infer<typeof SliderOptionsSchema>
