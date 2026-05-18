import { z } from 'zod'

export const KeySchema = z.string().min(1)
export type Key = z.infer<typeof KeySchema>

export const IdRefListSchema = z.union([KeySchema, z.array(KeySchema).readonly()])
export const KeyTokenSchema = z.string().min(1).startsWith('$')
