import { z } from 'zod'

export const ReactPropNameSchema = z.string().regex(/^[a-z][A-Za-z0-9]*Props$/)

export const ReactElementNameSchema = z.enum([
  'a',
  'button',
  'div',
  'h1',
  'h2',
  'h3',
  'input',
  'li',
  'ol',
  'span',
  'ul',
])
export type ReactElementName = z.infer<typeof ReactElementNameSchema>

export const ReactSemanticDefaultPropSchema = z.enum([
  'aria-label',
  'aria-hidden',
  'disabled',
  'tabIndex',
  'href',
  'rel',
  'target',
  'type',
])
export type ReactSemanticDefaultProp = z.infer<typeof ReactSemanticDefaultPropSchema>

export const ReactSemanticDefaultsSchema = z.partialRecord(
  ReactSemanticDefaultPropSchema,
  z.union([z.string(), z.number(), z.boolean()]),
)
export type ReactSemanticDefaults = z.infer<typeof ReactSemanticDefaultsSchema>

export const ReactPropOwnerSchema = z.enum(['root', 'item', 'toggle', 'panel'])
export type ReactPropOwner = z.infer<typeof ReactPropOwnerSchema>

export const ReactItemPropSchema = z
  .object({
    part: z.string().min(1),
    element: ReactElementNameSchema,
    owner: ReactPropOwnerSchema,
    whenKind: z.string().min(1).optional(),
    defaults: ReactSemanticDefaultsSchema.optional(),
    stopsPropagation: z.boolean().optional(),
  })
  .strict()
export type ReactItemProp = z.infer<typeof ReactItemPropSchema>
