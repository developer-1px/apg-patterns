import { ds } from '../../shared/designSystem'
import {
  parseFocusStrategy,
  parseInspectMode,
  parseItemClickAction,
  type TreeviewDemoState,
} from './treeviewDemoState'

export function InspectModeControl({
  value,
  onChange,
}: {
  value: TreeviewDemoState['inspectMode']
  onChange: (value: TreeviewDemoState['inspectMode']) => void
}) {
  return (
    <select className={ds.field} value={value} onChange={(event) => onChange(parseInspectMode(event.currentTarget.value))}>
      <option value="aria">aria</option>
      <option value="html">html</option>
    </select>
  )
}

export function FollowFocusControl({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
      <input
        type="checkbox"
        className={`size-4 rounded border border-zinc-300 bg-white text-zinc-900 accent-zinc-900 dark:border-white/20 dark:bg-white/[0.08] dark:accent-zinc-100 ${ds.focusRing}`}
        checked={value}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      followFocus
    </label>
  )
}

export function ItemClickActionControl({
  value,
  onChange,
}: {
  value: TreeviewDemoState['itemClickAction']
  onChange: (value: TreeviewDemoState['itemClickAction']) => void
}) {
  return (
    <label className="grid gap-1 text-xs text-zinc-600 dark:text-zinc-400">
      itemClickAction
      <select className={ds.field} value={value} onChange={(event) => onChange(parseItemClickAction(event.currentTarget.value))}>
        <option value="select">select</option>
        <option value="toggleExpand">toggleExpand</option>
        <option value="none">none</option>
      </select>
    </label>
  )
}

export function FocusStrategyControl({
  value,
  onChange,
}: {
  value: TreeviewDemoState['focusStrategy']
  onChange: (value: TreeviewDemoState['focusStrategy']) => void
}) {
  return (
    <label className="grid gap-1 text-xs text-zinc-600 dark:text-zinc-400">
      focusStrategy
      <select className={ds.field} value={value} onChange={(event) => onChange(parseFocusStrategy(event.currentTarget.value))}>
        <option value="rovingTabIndex">rovingTabIndex</option>
        <option value="ariaActiveDescendant">ariaActiveDescendant</option>
      </select>
    </label>
  )
}
