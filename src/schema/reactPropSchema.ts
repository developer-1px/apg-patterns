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

export const ReactSemanticDefaultsSchema = z.partialRecord(
  ReactSemanticDefaultPropSchema,
  z.union([z.string(), z.number(), z.boolean()]),
)

export const ReactPropOwnerSchema = z.enum(['root', 'item', 'toggle', 'panel'])

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
