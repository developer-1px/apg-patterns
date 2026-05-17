import { useRef } from 'react'
import type { PatternData, PatternEvent } from '../../../../src'

export function useListboxTypeahead({
  data,
  visibleKeys,
  onEvent,
}: {
  data: PatternData
  visibleKeys: readonly string[]
  onEvent: (event: PatternEvent) => void
}) {
  const typeaheadRef = useRef<{ query: string; timer: number | null }>({ query: '', timer: null })

  return (char: string) => {
    const state = typeaheadRef.current
    state.query += char.toLowerCase()
    if (state.timer !== null) window.clearTimeout(state.timer)
    state.timer = window.setTimeout(() => {
      state.query = ''
      state.timer = null
    }, 500)

    const start = data.state?.activeKey ? visibleKeys.indexOf(data.state.activeKey) : -1
    const ordered = [...visibleKeys.slice(start + 1), ...visibleKeys.slice(0, start + 1)]
    const match = ordered.find((key) => {
      const item = data.items[key]
      const text = (item?.textValue ?? item?.label ?? '').toLowerCase()
      return text.startsWith(state.query)
    })
    if (match) onEvent({ type: 'focus', key: match, meta: { reason: 'typeahead' } })
  }
}
