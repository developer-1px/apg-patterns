import { z } from 'zod'

export type JsonValue = string | number | boolean | null | readonly JsonValue[] | { readonly [key: string]: JsonValue }

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema).readonly(),
    z.record(z.string(), JsonValueSchema),
  ]),
)

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) return true
  const type = typeof value
  if (type === 'string' || type === 'boolean') return true
  if (type === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.every(isJsonValue)
  if (!isPlainRecord(value)) return false
  return Object.values(value).every(isJsonValue)
}

export function validateJsonExtensionFields(
  value: Record<string, unknown>,
  knownKeys: readonly string[],
  ctx: z.RefinementCtx,
) {
  const known = new Set(knownKeys)
  for (const [key, fieldValue] of Object.entries(value)) {
    if (known.has(key)) continue
    if (!isJsonValue(fieldValue)) {
      ctx.addIssue({
        code: 'custom',
        path: [key],
        message: 'value must be JSON-serializable',
      })
    }
  }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}
