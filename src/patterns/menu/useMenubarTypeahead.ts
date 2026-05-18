import { useRef } from 'react'
import type { PatternData, PatternEvent } from '../../schema'

export function useMenubarTypeahead(data: PatternData, rootKeys: readonly string[], onEvent: (event: PatternEvent) => void) {
  const ref = useRef<{ query: string; timer: number | null }>({ query: '', timer: null })
  return (char: string) => {
    const state = ref.current
    state.query += char.toLowerCase()
    if (state.timer !== null) window.clearTimeout(state.timer)
    state.timer = window.setTimeout(() => {
      state.query = ''
      state.timer = null
    }, 500)
    const start = data.state?.activeKey ? rootKeys.indexOf(data.state.activeKey) : -1
    const ordered = [...rootKeys.slice(start + 1), ...rootKeys.slice(0, start + 1)]
    const match = ordered.find((key) => (data.items[key]?.label ?? '').toLowerCase().startsWith(state.query))
    if (match) onEvent({ type: 'focus', key: match, meta: { reason: 'typeahead' } })
  }
}
