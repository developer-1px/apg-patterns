import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { type PatternData, type PatternEvent } from '../../../../src'
import { Listbox } from './Listbox'

/**
 * APG `examples/listbox-rearrangeable` 변형 — 툴바로 Up/Down (Alt+Arrow) 이동 +
 * Remove (Delete) 동작을 제공한다. 패턴 정의는 그대로 두고 demo 레이어가
 * data 를 재구성한다.
 */
export function RearrangeableListbox({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const rootKeys = data.relations?.rootKeys ?? []
  const activeKey = data.state?.activeKey ?? rootKeys[0] ?? null
  const selectedKeys = data.state?.selectedKeys ?? []

  const moveActive = (delta: -1 | 1) => {
    if (!activeKey) return
    const next = [...rootKeys]
    const idx = next.indexOf(activeKey)
    const target = idx + delta
    if (idx === -1 || target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target]!, next[idx]!]
    onEvent({ type: 'extension', name: 'listboxMove', key: activeKey, payload: { rootKeys: next } })
  }

  const removeActive = () => {
    if (!activeKey) return
    const idx = rootKeys.indexOf(activeKey)
    if (idx === -1) return
    const nextKeys = rootKeys.filter((k) => k !== activeKey)
    const nextActive = nextKeys[Math.min(idx, nextKeys.length - 1)] ?? null
    const nextSelected = selectedKeys.filter((k) => k !== activeKey)
    onEvent({ type: 'extension', name: 'listboxRemove', key: activeKey, payload: { rootKeys: nextKeys, activeKey: nextActive, selectedKeys: nextSelected } })
  }

  // Alt+ArrowUp/Down 키 처리 — Listbox 외부 wrapper 에서 capture.
  const handleKeyDown = (event: ReactKeyboardEvent) => {
    if (event.altKey && event.key === 'ArrowUp') {
      event.preventDefault()
      moveActive(-1)
      return
    }
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault()
      moveActive(1)
      return
    }
    if (event.key === 'Delete') {
      event.preventDefault()
      removeActive()
    }
  }

  const canUp = activeKey ? rootKeys.indexOf(activeKey) > 0 : false
  const canDown = activeKey ? rootKeys.indexOf(activeKey) < rootKeys.length - 1 : false

  const buttonClass =
    'rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700 outline-none hover:bg-zinc-50 focus:outline focus:outline-2 focus:outline-zinc-400 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500'

  return (
    <div className="grid gap-2" onKeyDown={handleKeyDown}>
      <div className="flex gap-1.5" role="toolbar" aria-label="Rearrange">
        <button type="button" className={buttonClass} onClick={() => moveActive(-1)} disabled={!canUp} aria-keyshortcuts="Alt+ArrowUp">
          Up
        </button>
        <button type="button" className={buttonClass} onClick={() => moveActive(1)} disabled={!canDown} aria-keyshortcuts="Alt+ArrowDown">
          Down
        </button>
        <button type="button" className={buttonClass} onClick={removeActive} disabled={!activeKey} aria-keyshortcuts="Delete">
          Remove
        </button>
      </div>
      <Listbox data={data} onEvent={onEvent} />
    </div>
  )
}
