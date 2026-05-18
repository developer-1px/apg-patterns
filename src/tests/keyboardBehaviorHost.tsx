import { act, fireEvent, render, screen } from '@testing-library/react'
import { useLayoutEffect, useReducer } from 'react'
import { useTreeviewPattern, type PatternData, type PatternEvent } from '../index'

const initialData = {
  items: {
    docs: { label: 'Docs' },
    adr: { label: 'ADR' },
    runtime: { label: 'Runtime' },
    schema: { label: 'Schema' },
    demo: { label: 'Demo' },
  },
  relations: {
    rootKeys: ['docs', 'demo'],
    childrenByKey: { docs: ['adr', 'runtime', 'schema'], adr: [], runtime: [], schema: [], demo: [] },
  },
  state: {
    activeKey: 'docs',
    expandedKeys: ['docs'],
    selectedKeys: ['runtime'],
    levelByKey: { docs: 1, demo: 1, adr: 2, runtime: 2, schema: 2 },
    posInSetByKey: { docs: 1, demo: 2, adr: 1, runtime: 2, schema: 3 },
    setSizeByKey: { docs: 2, demo: 2, adr: 3, runtime: 3, schema: 3 },
    typeaheadTextByKey: { docs: 'docs', adr: 'adr', runtime: 'runtime', schema: 'schema', demo: 'demo' },
  },
  refs: { label: 'tree' },
} satisfies PatternData

export type HostOptions = {
  followFocus?: boolean
  focusStrategy?: 'rovingTabIndex' | 'ariaActiveDescendant'
  itemClickAction?: 'select' | 'toggleExpand' | 'none'
  typeaheadEnabled?: boolean
  initialActiveKey?: string
}

export const tree = () => screen.getByTestId('tree')
export const item = (key: string) => document.getElementById(`treeitem-${key}`) as HTMLElement
export const visibleKeys = () => [...tree().querySelectorAll('[role="treeitem"]')].map((el) => (el.id).replace(/^treeitem-/, ''))
export const activeKey = () => visibleKeys().find((key) => item(key).getAttribute('tabindex') === '0' || item(key).tabIndex === 0)
export const selectedKeys = () => visibleKeys().filter((key) => item(key).getAttribute('aria-selected') === 'true')
export const expandedKeys = () => visibleKeys().filter((key) => item(key).getAttribute('aria-expanded') === 'true')
export const press = (key: string, opts: Record<string, unknown> = {}) => act(() => { fireEvent.keyDown(tree(), { key, code: key, ...opts }) })

export function renderHost(options: HostOptions = {}) {
  const events: PatternEvent[] = []
  render(<Host options={options} onEmit={(event) => events.push(event)} />)
  events.length = 0
  return events
}

function Host({ options = {}, onEmit }: { options?: HostOptions; onEmit?: (event: PatternEvent) => void }) {
  const seed: PatternData = options.initialActiveKey ? { ...initialData, state: { ...initialData.state, activeKey: options.initialActiveKey } } : initialData
  const [data, dispatch] = useReducer(reduce, seed)
  const treeRuntime = useTreeviewPattern({
    data,
    options: {
      followFocus: options.followFocus ?? false,
      focusStrategy: options.focusStrategy ?? 'rovingTabIndex',
      itemClickAction: options.itemClickAction ?? 'select',
      indicatorClickAction: 'toggleExpand',
      typeaheadEnabled: options.typeaheadEnabled ?? true,
    },
    onEvent: (event) => {
      onEmit?.(event)
      dispatch(event)
    },
  })
  useLayoutEffect(() => {
    const active = data.state?.activeKey
    if (!active) return
    const target = (options.focusStrategy ?? 'rovingTabIndex') === 'ariaActiveDescendant'
      ? document.querySelector<HTMLElement>('[role="tree"]')
      : document.getElementById(`treeitem-${active}`)
    target?.focus({ preventScroll: true })
  }, [data.state?.activeKey, options.focusStrategy])
  return (
    <div {...treeRuntime.getTreeProps()} data-testid="tree">
      {treeRuntime.items.map((runtimeItem) => (
        <div key={runtimeItem.key} {...runtimeItem.slotProps.treeitem}>
          <button type="button" {...runtimeItem.slotProps.indicator} aria-label={`toggle ${runtimeItem.key}`} />
          <span>{data.items[runtimeItem.key]?.label}</span>
        </div>
      ))}
    </div>
  )
}

function reduce(data: PatternData, event: PatternEvent | { type: 'reset' }): PatternData {
  if (event.type === 'reset') return initialData
  if (event.type === 'focus') return { ...data, state: { ...data.state, activeKey: event.key } }
  if (event.type === 'navigate') {
    const target = resolveNavTarget(event.direction, data)
    return target ? { ...data, state: { ...data.state, activeKey: target } } : data
  }
  if (event.type === 'select') return { ...data, state: { ...data.state, anchorKey: event.anchorKey, extentKey: event.extentKey, selectedKeys: [...event.keys] } }
  if (event.type === 'expand') {
    const expanded = new Set(data.state?.expandedKeys ?? [])
    if (event.expanded) expanded.add(event.key)
    else expanded.delete(event.key)
    return { ...data, state: { ...data.state, expandedKeys: [...expanded] } }
  }
  return data
}

function resolveNavTarget(direction: string, data: PatternData): string | undefined {
  const visible = getVisibleKeys(data)
  const active = data.state?.activeKey
  if (!active) return visible[0]
  const index = visible.indexOf(active)
  if (direction === 'next') return visible[Math.min(index + 1, visible.length - 1)]
  if (direction === 'previous') return visible[Math.max(index - 1, 0)]
  if (direction === 'first') return visible[0]
  if (direction === 'last') return visible[visible.length - 1]
  if (direction === 'child') return data.relations?.childrenByKey?.[active]?.[0]
  if (direction === 'parent') return Object.entries(data.relations?.childrenByKey ?? {}).find(([, children]) => children.includes(active))?.[0]
  return undefined
}

function getVisibleKeys(data: PatternData): string[] {
  const expanded = new Set(data.state?.expandedKeys ?? [])
  const visit = (key: string): string[] => [key, ...(expanded.has(key) ? (data.relations?.childrenByKey?.[key] ?? []).flatMap(visit) : [])]
  return (data.relations?.rootKeys ?? []).flatMap(visit)
}
