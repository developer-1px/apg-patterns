import type { Key } from '../../schema'

export function stepKey(keys: readonly Key[], active: Key, step: 1 | -1): Key | null {
  const nextIndex = keys.indexOf(active) + step
  return nextIndex < 0 || nextIndex >= keys.length ? null : keys[nextIndex]!
}

export function rangeBetween(keys: readonly Key[], from: Key, to: Key): Key[] | null {
  const start = keys.indexOf(from)
  const end = keys.indexOf(to)
  if (start === -1 || end === -1) return null
  const [lo, hi] = start < end ? [start, end] : [end, start]
  return keys.slice(lo, hi + 1)
}
