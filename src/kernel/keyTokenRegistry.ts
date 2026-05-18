import type { Key } from '../schema'
import type { PatternRuntimeContext } from './patternKernel'

type KeyTokenResolver = (key: Key | undefined | null, activeKey: Key | undefined | null, ctx?: PatternRuntimeContext) => Key | null | undefined

const keyTokenRegistry = new Map<string, KeyTokenResolver>([
  ['$key', (key) => key ?? null],
  ['$activeKey', (_key, activeKey) => activeKey ?? null],
  ['$anchorKey', (_key, _activeKey, ctx) => ctx?.data.state?.anchorKey ?? null],
  ['$extentKey', (_key, _activeKey, ctx) => ctx?.data.state?.extentKey ?? null],
])

export const defineKeyToken = (token: string, resolve: KeyTokenResolver) => void keyTokenRegistry.set(token, resolve)

export const hasKeyToken = (token: string) => keyTokenRegistry.has(token)

export function resolveKeyToken(token: string, key: Key | undefined | null, activeKey: Key | undefined | null, ctx?: PatternRuntimeContext): Key {
  const resolver = keyTokenRegistry.get(token)
  if (!resolver) throw new Error(`[apg-pattern] unknown keyToken token: "${token}" — register via defineKeyToken()`)
  const resolved = resolver(key, activeKey, ctx)
  if (!resolved) throw new Error(`Cannot resolve key token: ${token}`)
  return resolved
}
