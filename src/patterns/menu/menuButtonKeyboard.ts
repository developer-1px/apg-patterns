import type { PatternData } from '../../schema'

export function resolveMenuButtonKey(key: string, keys: readonly string[], activeKey: string | null | undefined, data: PatternData) {
  const availableKeys = getAvailableMenuButtonKeys(keys, data)
  if (availableKeys.length === 0) return undefined
  const index = activeKey ? availableKeys.indexOf(activeKey) : -1
  if (key === 'ArrowDown') return availableKeys[(index + 1 + availableKeys.length) % availableKeys.length]
  if (key === 'ArrowUp') return availableKeys[(index - 1 + availableKeys.length) % availableKeys.length]
  if (key === 'Home') return availableKeys[0]
  if (key === 'End') return availableKeys[availableKeys.length - 1]
  if (key.length === 1 && /\S/.test(key)) return resolveMenuButtonTypeaheadKey(key, availableKeys, index, data)
  return undefined
}

function getAvailableMenuButtonKeys(keys: readonly string[], data: PatternData): readonly string[] {
  const disabledKeys = new Set(data.state?.disabledKeys ?? [])
  return keys.filter((key) => !disabledKeys.has(key))
}

function resolveMenuButtonTypeaheadKey(key: string, keys: readonly string[], activeIndex: number, data: PatternData) {
  const query = key.toLocaleLowerCase()
  for (let offset = 1; offset <= keys.length; offset += 1) {
    const candidate = keys[(activeIndex + offset + keys.length) % keys.length]!
    const label = data.items[candidate]?.label ?? candidate
    if (label.toLocaleLowerCase().startsWith(query)) return candidate
  }
  return undefined
}
