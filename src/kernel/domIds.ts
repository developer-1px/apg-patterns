import type { Key, PatternOptions } from '../schema'

export function normalizeDomIdPart(value: Key | string): string {
  const normalized = String(value)
    .trim()
    .replace(/[^A-Za-z0-9_.:-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'item'
}

export function createElementId(prefix: string, key: Key): string {
  return `${prefix}${normalizeDomIdPart(key)}`
}

export function createElementIdPrefix(options: PatternOptions | undefined, defaultPrefix: string, instanceId?: string): string {
  if (options?.elementIdPrefix) return options.elementIdPrefix
  if (!instanceId) return defaultPrefix
  return `${defaultPrefix}${normalizeDomIdPart(instanceId)}-`
}
