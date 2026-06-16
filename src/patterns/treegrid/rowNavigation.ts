import { defineNavigationTarget } from '../../kernel/patternKernel'
import type { Key, PatternData } from '../../schema'
import { cellRowKey, visibleRowKeys } from './geometry'

const PAGE_STEP = 10

const activeRowKey = (ctx: { activeKey: Key | null; data: PatternData }, rows: readonly Key[]): Key | null => {
  if (!ctx.activeKey) return null
  if (rows.includes(ctx.activeKey)) return ctx.activeKey
  return cellRowKey(ctx.data, ctx.activeKey)
}

let treegridRowNavigationRegistered = false

export function registerTreegridRowNavigation() {
  if (treegridRowNavigationRegistered) return
  treegridRowNavigationRegistered = true

defineNavigationTarget('treegridRow', (target, ctx) => {
  const action = target.action
  const rows = visibleRowKeys(ctx.data)
  if (rows.length === 0) return null
  if (action === 'gridStart') return rows[0] ?? null
  if (action === 'gridEnd') return rows[rows.length - 1] ?? null
  const current = activeRowKey(ctx, rows)
  if (!current) return rows[0] ?? null
  const idx = rows.indexOf(current)
  if (idx === -1) return null
  if (action === 'up') return rows[Math.max(0, idx - 1)] ?? null
  if (action === 'down') return rows[Math.min(rows.length - 1, idx + 1)] ?? null
  return null
})

defineNavigationTarget('treegridRowPage', (target, ctx) => {
  const direction = target.direction ?? 'down'
  const rows = visibleRowKeys(ctx.data)
  if (rows.length === 0) return null
  const current = activeRowKey(ctx, rows)
  if (!current) return rows[0] ?? null
  const idx = rows.indexOf(current)
  if (idx === -1) return null
  const next = direction === 'down'
    ? Math.min(rows.length - 1, idx + PAGE_STEP)
    : Math.max(0, idx - PAGE_STEP)
  return rows[next] ?? null
})
}
