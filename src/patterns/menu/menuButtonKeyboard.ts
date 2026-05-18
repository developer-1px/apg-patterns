import type { PatternData } from '../../schema'

export function resolveMenuButtonKey(key: string, keys: readonly string[], activeKey: string | null | undefined, data: PatternData) {
  if (keys.length === 0) return undefined
  const index = activeKey ? keys.indexOf(activeKey) : -1
  if (key === 'ArrowDown') return keys[(index + 1 + keys.length) % keys.length]
  if (key === 'ArrowUp') return keys[(index - 1 + keys.length) % keys.length]
  if (key === 'Home') return keys[0]
  if (key === 'End') return keys[keys.length - 1]
  if (key.length === 1 && /\S/.test(key)) return resolveMenuButtonTypeaheadKey(key, keys, index, data)
  return undefined
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
